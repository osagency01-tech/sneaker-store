import type { Operator } from "./countries";

export type CheckoutInput = {
  amount: number;
  phone: string;
  operator: Operator;
  countryCode: string;
  externalReference: string;
  description: string;

  // Requis uniquement pour certains opérateurs
  // comme Orange CI.
  otpCode?: string;
};

export type CheckoutResult =
  | {
      kind: "ussd_push";
      reference: string;
      providerTxId: string | null;
      message: string;
    }
  | {
      kind: "redirect";
      reference: string;
      providerTxId: string | null;
      url: string;
      message: string;
    }
  | {
      kind: "otp_required";
      reference: string;
      providerTxId: string | null;
      message: string;
      ussdCode: string | null;
    }
  | {
      kind: "error";
      message: string;
    };

export type PaymentState =
  | "paid"
  | "rejected"
  | "pending";

export interface PaymentProvider {
  readonly name: string;

  createCheckout(
    input: CheckoutInput
  ): Promise<CheckoutResult>;

  checkStatus(
    externalReference: string
  ): Promise<PaymentState>;
}