/* ==================================================================== *
 *  SebPay — Mobile Money collection
 *
 *  Gestion :
 *    - Wave
 *    - Orange
 *    - MTN
 *    - Moov
 *    - OTP pour les opérateurs qui l'exigent
 *
 *  Les appels passent par RELAY_URL si configuré afin de disposer
 *  d'une IP fixe autorisée par SebPay.
 * ==================================================================== */

import type {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  PaymentState,
} from "./types";

import type { Operator } from "./countries";

const BASE_URL =
  "https://newapi.sebpay.bj/api/v1";

const RELAY_URL =
  process.env.RELAY_URL || "";

const RELAY_SECRET =
  process.env.RELAY_SECRET || "";

const OPERATOR_TO_SEBPAY: Record<
  Operator,
  string
> = {
  wave: "wave",
  orange: "orange",
  mtn: "mtn",
  moov: "moov",
};

/* ==================================================================== *
 *  FALLBACK USSD
 *
 *  Utilisé uniquement si SebPay signale qu'un OTP est requis mais
 *  ne renvoie pas le code USSD dans /operators.
 *
 *  Le code dynamique renvoyé par SebPay reste prioritaire.
 * ==================================================================== */

const DEFAULT_USSD_CODES: Partial<
  Record<Operator, string>
> = {
  orange: "*144*4*4#",
};

const PAID = [
  "approved",
  "success",
  "successful",
  "paid",
  "completed",
];

const REJECTED = [
  "rejected",
  "failed",
  "cancelled",
  "declined",
  "expired",
];

/* ==================================================================== *
 *  TRADUCTION DES ERREURS
 * ==================================================================== */

function humanizeSebpayError(
  raw: string
): string {
  const s = raw.toLowerCase();

  if (
    /(network|operator|réseau|opérateur).*(match|correspond)|wrong network|invalid operator/.test(
      s
    )
  ) {
    return "Le numéro ne correspond pas à l'opérateur choisi. Vérifiez votre numéro et votre réseau.";
  }

  if (
    /insufficient|balance|solde|funds/.test(s)
  ) {
    return "Solde Mobile Money insuffisant pour ce paiement.";
  }

  if (
    /invalid.*(phone|number|msisdn)|numéro.*invalide/.test(
      s
    )
  ) {
    return "Numéro de téléphone invalide. Vérifiez le numéro saisi.";
  }

  if (
    /api key|unauthorized|forbidden|not active|inactive/.test(
      s
    )
  ) {
    return "Le service de paiement est momentanément indisponible. Réessayez dans un instant.";
  }

  if (
    /timeout|expired|délai/.test(s)
  ) {
    return "Le délai de la demande a expiré. Réessayez.";
  }

  if (
    /duplicate|already|déjà/.test(s)
  ) {
    return "Cette commande a déjà une demande de paiement en cours.";
  }

  if (
    /limit|plafond/.test(s)
  ) {
    return "Le montant dépasse le plafond autorisé pour ce compte Mobile Money.";
  }

  return "Le paiement n'a pas pu être lancé. Réessayez ou choisissez un autre opérateur.";
}

/* ==================================================================== *
 *  EXTRACTION OTP_REQUIRED
 * ==================================================================== */

function isOtpRequiredError(
  data: any
): boolean {
  const code = String(
    data?.code ??
      data?.error_code ??
      data?.data?.code ??
      data?.error?.code ??
      ""
  ).toUpperCase();

  const message = String(
    data?.message ??
      data?.error ??
      data?.data?.message ??
      data?.detail ??
      ""
  ).toLowerCase();

  return (
    code === "OTP_REQUIRED" ||
    message.includes("otp requis") ||
    message.includes("otp required") ||
    message.includes("code otp requis")
  );
}

/* ==================================================================== *
 *  INFORMATIONS OPÉRATEUR
 * ==================================================================== */

type SebpayOperator = {
  slug?: string;
  operator?: string;
  name?: string;
  country?: string;
  otp_required?: boolean;
  ussd_code?: string | null;
};

function extractOperators(
  data: any
): SebpayOperator[] {
  /*
   * SebPay peut renvoyer les opérateurs sous différentes formes.
   * On essaie les structures les plus courantes.
   */

  const candidates = [
    data?.data?.operators,
    data?.data,
    data?.operators,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  /*
   * Cas où data.data est directement un objet représentant
   * un opérateur unique.
   */
  if (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data) &&
    (
      "slug" in data.data ||
      "operator" in data.data ||
      "ussd_code" in data.data
    )
  ) {
    return [data.data];
  }

  return [];
}

/* ==================================================================== *
 *  PROVIDER
 * ==================================================================== */

export class SebpayProvider
  implements PaymentProvider
{
  readonly name = "sebpay";

  constructor(
    private cfg: {
      publicKey: string;
      secretKey: string;
    }
  ) {}

  private headers() {
    return {
      "X-Public-Key": this.cfg.publicKey,
      "X-Secret-Key": this.cfg.secretKey,
      "Content-Type": "application/json",
    };
  }

  /* ================================================================== *
   *  APPEL API
   * ================================================================== */

  private async call(
    method: "POST" | "GET",
    path: string,
    body?: unknown
  ): Promise<{
    ok: boolean;
    status: number;
    data: any;
  }> {
    /*
     * ================================================================
     * RELAIS IP FIXE
     * ================================================================
     */

    if (RELAY_URL) {
      const res = await fetch(
        RELAY_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "x-relay-secret":
              RELAY_SECRET,
          },
          body: JSON.stringify({
            method,
            path,
            publicKey:
              this.cfg.publicKey,
            secretKey:
              this.cfg.secretKey,
            body:
              body ?? null,
          }),
        }
      );

      const data =
        await res
          .json()
          .catch(() => ({}));

      return {
        ok: res.ok,
        status: res.status,
        data,
      };
    }

    /*
     * ================================================================
     * APPEL DIRECT SEBPAY
     * ================================================================
     */

    const res = await fetch(
      `${BASE_URL}${path}`,
      {
        method,
        headers: this.headers(),
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );

    const data =
      await res
        .json()
        .catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  }

  /* ================================================================== *
   *  INFORMATIONS OTP
   *
   *  SebPay recommande GET /operators pour savoir dynamiquement
   *  si un opérateur nécessite un OTP et quel code USSD utiliser.
   * ================================================================== */

  private async getOtpInformation(
    countryCode: string,
    operator: Operator
  ): Promise<{
    required: boolean;
    ussdCode: string | null;
  }> {
    try {
      const result = await this.call(
        "GET",
        `/operators?country=${encodeURIComponent(
          countryCode
        )}`
      );

      if (!result.ok) {
        console.error(
          "SebPay /operators error:",
          result.status,
          result.data
        );

        return {
          required: false,
          ussdCode: null,
        };
      }

      const operators =
        extractOperators(result.data);

      const wantedOperator =
        (
          OPERATOR_TO_SEBPAY[
            operator
          ] ?? ""
        ).toLowerCase();

      const found =
        operators.find(
          (item) => {
            const slug =
              String(
                item.slug ??
                  item.operator ??
                  item.name ??
                  ""
              )
                .trim()
                .toLowerCase();

            return (
              slug === wantedOperator
            );
          }
        );

      if (!found) {
        console.warn(
          "SebPay opérateur introuvable dans /operators:",
          {
            countryCode,
            operator,
            wantedOperator,
            operators,
          }
        );

        return {
          required: false,
          ussdCode: null,
        };
      }

      const ussdCode =
        typeof found.ussd_code ===
          "string" &&
        found.ussd_code.trim()
          ? found.ussd_code.trim()
          : null;

      return {
        required:
          found.otp_required === true,
        ussdCode,
      };
    } catch (error) {
      console.error(
        "SebPay getOtpInformation exception:",
        error
      );

      return {
        required: false,
        ussdCode: null,
      };
    }
  }

  /* ================================================================== *
   *  CHECKOUT
   * ================================================================== */

  async createCheckout(
    input: CheckoutInput
  ): Promise<CheckoutResult> {
    const sebpayOperator =
      OPERATOR_TO_SEBPAY[
        input.operator
      ] ?? "mtn";

    const payload: Record<
      string,
      unknown
    > = {
      amount: input.amount,
      currency: "XOF",
      country:
        input.countryCode,
      phone: input.phone,
      operator:
        sebpayOperator,
      external_reference:
        input.externalReference,
      description:
        input.description,
    };

    /*
     * On ajoute otp_code uniquement lorsqu'il est réellement fourni.
     *
     * Première tentative :
     *   pas de otp_code
     *
     * Deuxième tentative :
     *   otp_code reçu par l'utilisateur
     */
    if (
      input.otpCode &&
      input.otpCode.trim()
    ) {
      payload.otp_code =
        input.otpCode.trim();
    }

    try {
      const {
        ok,
        data,
      } = await this.call(
        "POST",
        "/collections",
        payload
      );

      if (!ok) {
        /* ============================================================
         * OTP REQUIS
         * ============================================================ */

        if (
          isOtpRequiredError(data)
        ) {
          /*
           * On demande d'abord à SebPay le code USSD officiel
           * pour cet opérateur.
           */
          const otpInfo =
            await this.getOtpInformation(
              input.countryCode,
              input.operator
            );

          /*
           * Si SebPay ne renvoie pas de code USSD,
           * on utilise notre fallback pour Orange.
           *
           * Le code SebPay reste TOUJOURS prioritaire.
           */
          const ussdCode =
            otpInfo.ussdCode ||
            DEFAULT_USSD_CODES[
              input.operator
            ] ||
            null;

          console.log(
            "SebPay OTP requis:",
            {
              country:
                input.countryCode,
              operator:
                input.operator,
              ussdCode,
              dynamic:
                otpInfo.ussdCode,
            }
          );

          return {
            kind:
              "otp_required",
            reference:
              input.externalReference,
            providerTxId:
              null,
            ussdCode,
            message:
              ussdCode
                ? `Pour recevoir votre code OTP, composez ${ussdCode} sur votre téléphone.`
                : "Un code OTP est requis pour ce paiement. Veuillez suivre les instructions de votre opérateur.",
          };
        }

        /* ============================================================
         * AUTRE ERREUR
         * ============================================================ */

        const raw =
          String(
            data?.message ||
              data?.error ||
              data?.data?.message ||
              data?.detail ||
              ""
          );

        console.error(
          "SebPay createCheckout error:",
          raw,
          data?.errors ||
            data?.detail ||
            ""
        );

        return {
          kind: "error",
          message:
            humanizeSebpayError(
              raw
            ),
        };
      }

      /* ============================================================
       * SUCCÈS
       * ============================================================ */

      const txId =
        data?.data
          ?.transaction_id ??
        data?.transaction_id ??
        null;

      const providerLink =
        data?.data
          ?.provider_link ??
        data?.provider_link;

      /* ============================================================
       * WAVE / REDIRECTION
       * ============================================================ */

      if (providerLink) {
        return {
          kind: "redirect",
          reference:
            input.externalReference,
          providerTxId:
            txId,
          url:
            providerLink,
          message:
            "Vous allez être redirigé vers Wave pour valider votre paiement.",
        };
      }

      /* ============================================================
       * PUSH USSD / NOTIFICATION
       * ============================================================ */

      return {
        kind:
          "ussd_push",
        reference:
          input.externalReference,
        providerTxId:
          txId,
        message:
          "Un message vient d'être envoyé sur votre téléphone. Composez votre code Mobile Money pour valider le paiement.",
      };
    } catch (error) {
      console.error(
        "SebPay createCheckout exception:",
        error
      );

      return {
        kind: "error",
        message:
          "Connexion au service de paiement impossible. Réessayez.",
      };
    }
  }

  /* ================================================================== *
   *  STATUT
   * ================================================================== */

  async checkStatus(
    externalReference: string
  ): Promise<PaymentState> {
    try {
      const {
        ok,
        data,
      } = await this.call(
        "GET",
        `/collections/${encodeURIComponent(
          externalReference
        )}`
      );

      if (!ok) {
        return "pending";
      }

      const s =
        String(
          data?.data?.status ??
            data?.status ??
            ""
        ).toLowerCase();

      if (PAID.includes(s)) {
        return "paid";
      }

      if (
        REJECTED.includes(s)
      ) {
        return "rejected";
      }

      return "pending";
    } catch {
      return "pending";
    }
  }
}