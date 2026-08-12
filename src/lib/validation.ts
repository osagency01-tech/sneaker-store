import { z } from "zod";
import { COUNTRIES } from "./payment/countries";

const countryCodes = COUNTRIES.map((c) => c.code) as [string, ...string[]];

export const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2, "Nom trop court").max(80),
    phone: z.string().trim().min(6, "Numéro WhatsApp invalide").max(20),
    email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
    country: z.enum(countryCodes),
  }),
  lines: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive().max(20),
      })
    )
    .min(1, "Panier vide"),
});

export const payInitSchema = z.object({
  externalReference: z.string().min(4),
  operator: z.enum(["wave", "orange", "mtn", "moov"]),
  phone: z.string().trim().min(6).max(20),
  countryCode: z.enum(countryCodes),
});

export const verifySchema = z.object({
  externalReference: z.string().min(4),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
