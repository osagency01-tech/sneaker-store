/* ==================================================================== *
 *  Vérification du paiement — CÔTÉ SERVEUR (service_role).
 *  Appelée par la route de polling. Interroge SebPay via
 *  external_reference et fait avancer les statuts de façon idempotente.
 *
 *    paid     -> payment=SUCCESS + confirm_order_paid() (décrément stock,
 *                order=PAID). La confirmation navigateur ne suffit jamais.
 *    rejected -> payment=FAILED.
 *    pending  -> inchangé.
 * ==================================================================== */

import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/payment";
import { sendOrderConfirmation } from "@/lib/email";

export type VerifyResult =
  | { state: "paid"; orderStatus: string }
  | { state: "rejected" }
  | { state: "pending" }
  | { state: "error"; message: string };

export async function verifyPayment(externalReference: string): Promise<VerifyResult> {
  const db = createAdminClient();

  const { data: payment, error } = await db
    .from("payments")
    .select("id, order_id, status")
    .eq("external_reference", externalReference)
    .single();

  if (error || !payment) return { state: "error", message: "Paiement introuvable." };

  // Déjà tranché : on ne réinterroge pas l'agrégateur
  if (payment.status === "SUCCESS") return { state: "paid", orderStatus: "PAID" };
  if (payment.status === "FAILED") return { state: "rejected" };

  const provider = getProvider();
  const state = await provider.checkStatus(externalReference);

  if (state === "paid") {
    // Ordre important : on confirme la commande (transaction stock) AVANT
    // de marquer le paiement, pour ne pas laisser un SUCCESS sans stock.
    const { error: confirmErr } = await db.rpc("confirm_order_paid", {
      p_order_id: payment.order_id,
    });
    if (confirmErr) {
      return { state: "error", message: "Confirmation impossible : " + confirmErr.message };
    }
    await db.from("payments").update({ status: "SUCCESS" }).eq("id", payment.id);

    // Email de confirmation (best-effort, ne bloque jamais)
    try {
      const { data: full } = await db
        .from("orders")
        .select("order_number, total, access_token, customer:customers(email), items:order_items(product_name, size, quantity)")
        .eq("id", payment.order_id)
        .single();
      const email = (full as any)?.customer?.email;
      if (full && email) {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
        await sendOrderConfirmation({
          to: email,
          orderNumber: (full as any).order_number,
          total: (full as any).total,
          trackingUrl: `${base}/order/${payment.order_id}?token=${(full as any).access_token}`,
          items: ((full as any).items ?? []).map((i: any) => ({
            name: i.product_name, size: i.size, quantity: i.quantity,
          })),
        });
      }
    } catch { /* email non bloquant */ }

    return { state: "paid", orderStatus: "PAID" };
  }

  if (state === "rejected") {
    await db.from("payments").update({ status: "FAILED" }).eq("id", payment.id);
    return { state: "rejected" };
  }

  return { state: "pending" };
}
