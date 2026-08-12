import type { Operator } from "./countries";

export type CheckoutInput = {
  amount: number;           // XOF, recalculé serveur — jamais fourni par le client
  phone: string;            // MSISDN normalisé
  operator: Operator;
  countryCode: string;
  externalReference: string;// clé d'idempotence = ce qu'on interroge au polling
  description: string;
};

export type CheckoutResult =
  | { kind: "ussd_push"; reference: string; providerTxId: string | null; message: string }
  | { kind: "error"; message: string };

export type PaymentState = "paid" | "rejected" | "pending";

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  checkStatus(externalReference: string): Promise<PaymentState>;
}
