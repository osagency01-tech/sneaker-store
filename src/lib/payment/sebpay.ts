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

/* Traduit une erreur brute SebPay (message technique, souvent en anglais)
   en message court et compréhensible pour un client final. On ne renvoie
   JAMAIS le JSON brut de l'erreur — seulement ce texte. */
function humanizeSebpayError(raw: string): string {
  const s = raw.toLowerCase();

  if (/(network|operator|réseau|opérateur).*(match|correspond)|wrong network|invalid operator/.test(s)) {
    return "Le numéro ne correspond pas à l'opérateur choisi. Vérifiez votre numéro et votre réseau.";
  }
  if (/insufficient|balance|solde|funds/.test(s)) {
    return "Solde Mobile Money insuffisant pour ce paiement.";
  }
  if (/invalid.*(phone|number|msisdn)|numéro.*invalide/.test(s)) {
    return "Numéro de téléphone invalide. Vérifiez le numéro saisi.";
  }
  if (/api key|unauthorized|forbidden|not active|inactive/.test(s)) {
    return "Le service de paiement est momentanément indisponible. Réessayez dans un instant.";
  }
  if (/timeout|expired|délai/.test(s)) {
    return "Le délai de la demande a expiré. Réessayez.";
  }
  if (/duplicate|already|déjà/.test(s)) {
    return "Cette commande a déjà une demande de paiement en cours.";
  }
  if (/limit|plafond/.test(s)) {
    return "Le montant dépasse le plafond autorisé pour ce compte Mobile Money.";
  }

  return "Le paiement n'a pas pu être lancé. Réessayez ou choisissez un autre opérateur.";
}

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
        // Le détail technique (data.errors/detail) part dans les logs serveur
        // uniquement — jamais montré au client, qui ne voit qu'un message clair.
        const raw = String(data?.message || data?.error || "");
        if (raw) console.error("SebPay createCheckout error:", raw, data?.errors || data?.detail || "");
        return { kind: "error", message: humanizeSebpayError(raw) };
      }

      const txId = data?.data?.transaction_id ?? null;
      const providerLink = data?.data?.provider_link;

      // Wave fonctionne par redirection (pas de push USSD) : SebPay renvoie
      // une provider_link vers laquelle le client doit être envoyé.
      if (providerLink) {
        return {
          kind: "redirect",
          reference: input.externalReference,
          providerTxId: txId,
          url: providerLink,
          message: "Vous allez être redirigé vers Wave pour valider votre paiement.",
        };
      }

      return {
        kind: "ussd_push",
        reference: input.externalReference,
        providerTxId: txId,
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