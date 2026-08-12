/* ==================================================================== *
 *  SebPay — Mobile Money collection (push USSD), zone XOF.
 *
 *  Endpoint : https://newapi.sebpay.bj/api/v1
 *  Auth     : X-Public-Key + X-Secret-Key
 *  Modèle   : "collection". Un push USSD est envoyé sur le téléphone du
 *             client. Pas de webhook fiable -> on interroge l'API avec
 *             l'external_reference. "approved" = payé, "rejected" = refusé.
 * ==================================================================== */

import type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentState } from "./types";
import type { Operator } from "./countries";

const BASE_URL = "https://newapi.sebpay.bj/api/v1";

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
      const res = await fetch(`${BASE_URL}/collections`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
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
      const res = await fetch(`${BASE_URL}/collections/${externalReference}`, {
        method: "GET",
        headers: this.headers(),
      });
      if (!res.ok) return "pending";
      const data = await res.json().catch(() => ({} as any));
      const s = (data?.data?.status || "").toLowerCase();
      if (PAID.includes(s)) return "paid";
      if (REJECTED.includes(s)) return "rejected";
      return "pending";
    } catch {
      return "pending";
    }
  }
}
