/* ==================================================================== *
 *  Point de branchement paiement. Bascule SebPay <-> Mock via
 *  PAYMENT_PROVIDER. Le Mock permet de dérouler tout le tunnel sans
 *  agrégateur branché (retourne "paid" hors production).
 * ==================================================================== */

import type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentState } from "./types";
import { SebpayProvider } from "./sebpay";

class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (process.env.NODE_ENV === "production") {
      return { kind: "error", message: "Aucun agrégateur de paiement configuré." };
    }
    return {
      kind: "ussd_push",
      reference: input.externalReference,
      providerTxId: "MOCK-TX",
      message: "Mode démo : paiement simulé. Le statut passera à payé automatiquement.",
    };
  }

  async checkStatus(): Promise<PaymentState> {
    return process.env.NODE_ENV !== "production" ? "paid" : "pending";
  }
}

let cached: PaymentProvider | null = null;

export function getProvider(): PaymentProvider {
  if (cached) return cached;
  const which = process.env.PAYMENT_PROVIDER ?? "mock";
  if (which === "sebpay") {
    const publicKey = process.env.SEBPAY_PUBLIC_KEY;
    const secretKey = process.env.SEBPAY_SECRET_KEY;
    cached = publicKey && secretKey
      ? new SebpayProvider({ publicKey, secretKey })
      : new MockProvider();
  } else {
    cached = new MockProvider();
  }
  return cached;
}

export type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentState };
