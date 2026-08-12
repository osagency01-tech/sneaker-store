/* ==================================================================== *
 *  SebPay — Mobile Money collection (push USSD), zone XOF.
 *
 *  Les appels ne partent PAS directement d'ici : SebPay exige une IP
 *  fixe en liste blanche, or Vercel n'en a pas. On passe donc par un
 *  relais (serveur à IP fixe) qui transmet à SebPay. Le relais est
 *  défini par RELAY_URL + RELAY_SECRET. Si RELAY_URL est absent, on
 *  appelle SebPay en direct (utile en local).
 * ==================================================================== */

import type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentState } from "./types";
import type { Operator } from "./countries";

const BASE_URL = "https://newapi.sebpay.bj/api/v1";

const RELAY_URL = process.env.RELAY_URL || "";
const RELAY_SECRET = process.env.RELAY_SECRET || "";

const OPERATOR_TO_SEBPAY: Record<Operator, string> = {
  wave: "WAVE",
  orange: "ORANGE",
  mtn: "MTN",
  moov: "MOOV",
};

const PAID = ["approved", "success", "successful", "paid", "completed"];
const REJECTED = ["rejected", "failed", "cancelled", "declined", "expired"];

export class SebpayProvider implements PaymentProvider {
  readonly name = "sebpay";

  constructor(private cfg: { publicKey: string; secretKey: string }) {}

  private headers() {
    return {
      "X-Public-Key": this.cfg.publicKey,
      "X-Secret-Key": this.cfg.secretKey,
      "Content-Type": "application/json",
    };
  }

  /* Appel unifié : par le relais si configuré, sinon direct.
     - method/path ciblent l'API SebPay (ex: POST /collections)
     - le relais reçoit { method, path, body } et refait l'appel
       depuis son IP fixe. */
  private async call(
    method: "POST" | "GET",
    path: string,
    body?: unknown
  ): Promise<{ ok: boolean; status: number; data: any }> {
    if (RELAY_URL) {
      const res = await fetch(RELAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-relay-secret": RELAY_SECRET,
        },
        body: JSON.stringify({
          method,
          path,
          publicKey: this.cfg.publicKey,
          secretKey: this.cfg.secretKey,
          body: body ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    }

    /* Pas de relais (local) : appel direct. */
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const payload = {
      amount: input.amount,
      currency: "XOF",
      country: input.countryCode,
      phone: input.phone,
      operator: OPERATOR_TO_SEBPAY[input.operator] ?? "MTN",
      external_reference: input.externalReference,
      description: input.description,
    };

    try {
      const { ok, data } = await this.call("POST", "/collections", payload);

      if (!ok) {
        const detail = data?.errors || data?.detail || data?.details || null;
        return {
          kind: "error",
          message:
            (data?.message || data?.error || "Le paiement n'a pas pu être lancé.") +
            (detail ? " — " + JSON.stringify(detail) : ""),
        };
      }

      return {
        kind: "ussd_push",
        reference: input.externalReference,
        providerTxId: data?.data?.transaction_id ?? null,
        message:
          "Un message vient d'être envoyé sur votre téléphone. Composez votre code Mobile Money pour valider le paiement.",
      };
    } catch {
      return { kind: "error", message: "Connexion au service de paiement impossible. Réessayez." };
    }
  }

  async checkStatus(externalReference: string): Promise<PaymentState> {
    try {
      const { ok, data } = await this.call("GET", `/collections/${externalReference}`);
      if (!ok) return "pending";
      const s = (data?.data?.status || "").toLowerCase();
      if (PAID.includes(s)) return "paid";
      if (REJECTED.includes(s)) return "rejected";
      return "pending";
    } catch {
      return "pending";
    }
  }
}