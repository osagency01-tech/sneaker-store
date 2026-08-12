/* ==================================================================== *
 *  Création de commande — CÔTÉ SERVEUR uniquement (service_role).
 *
 *  Règle d'or : le client envoie seulement des (variant_id, quantity).
 *  Le serveur relit les prix et le stock en base, recalcule sous-total,
 *  livraison et total, vérifie la disponibilité, puis crée client +
 *  commande + lignes + paiement PENDING. Aucun montant client n'est
 *  jamais utilisé.
 * ==================================================================== */

import { createAdminClient } from "@/lib/supabase/admin";
import { computeShipping } from "./shipping";
import { orderNumber } from "@/lib/format";

export type IncomingLine = { variantId: string; quantity: number };

export type CustomerInput = {
  fullName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  country: string;
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      accessToken: string;
      total: number;
      externalReference: string;
    }
  | { ok: false; error: string };

export async function createOrder(
  lines: IncomingLine[],
  customer: CustomerInput
): Promise<CreateOrderResult> {
  const db = createAdminClient();

  const cleaned = lines
    .filter((l) => l.variantId && Number.isFinite(l.quantity) && l.quantity > 0)
    .map((l) => ({ variantId: l.variantId, quantity: Math.floor(l.quantity) }));

  if (cleaned.length === 0) return { ok: false, error: "Panier vide." };

  // Relire les variantes concernées + produit (prix, stock, statut)
  const variantIds = cleaned.map((l) => l.variantId);
  const { data: variants, error: vErr } = await db
    .from("product_variants")
    .select("id, size, stock, product_id, products(id, name, price, status)")
    .in("id", variantIds);

  if (vErr || !variants) return { ok: false, error: "Erreur de lecture du catalogue." };

  // Construire les lignes serveur avec prix/stock réels
  let subtotal = 0;
  const orderItems: {
    product_id: string;
    variant_id: string;
    product_name: string;
    size: string;
    unit_price: number;
    quantity: number;
  }[] = [];

  for (const line of cleaned) {
    const v: any = variants.find((x: any) => x.id === line.variantId);
    if (!v || !v.products) return { ok: false, error: "Article introuvable." };
    if (v.products.status !== "active")
      return { ok: false, error: `« ${v.products.name} » n'est plus disponible.` };
    if (v.stock < line.quantity)
      return {
        ok: false,
        error: `Stock insuffisant pour « ${v.products.name} » taille ${v.size}.`,
      };

    const unit = v.products.price as number;
    subtotal += unit * line.quantity;
    orderItems.push({
      product_id: v.product_id,
      variant_id: v.id,
      product_name: v.products.name,
      size: v.size,
      unit_price: unit,
      quantity: line.quantity,
    });
  }

  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  // Créer le client
  const { data: cust, error: cErr } = await db
    .from("customers")
    .insert({
      full_name: customer.fullName,
      phone: customer.phone,
      email: customer.email || null,
      city: customer.city ?? null,
      address: customer.address ?? null,
      country: customer.country,
    })
    .select("id")
    .single();

  if (cErr || !cust) return { ok: false, error: "Impossible d'enregistrer le client." };

  // Créer la commande
  const num = orderNumber();
  const { data: order, error: oErr } = await db
    .from("orders")
    .insert({
      order_number: num,
      customer_id: cust.id,
      status: "PENDING_PAYMENT",
      subtotal,
      shipping,
      total,
    })
    .select("id, order_number, access_token")
    .single();

  if (oErr || !order) return { ok: false, error: "Impossible de créer la commande." };

  // Lignes
  const { error: iErr } = await db
    .from("order_items")
    .insert(orderItems.map((it) => ({ ...it, order_id: order.id })));
  if (iErr) return { ok: false, error: "Impossible d'enregistrer les articles." };

  // Paiement PENDING — external_reference sert de clé de polling
  const externalReference = `${num}-${order.id.slice(0, 8)}`;
  const { error: pErr } = await db.from("payments").insert({
    order_id: order.id,
    provider: process.env.PAYMENT_PROVIDER ?? "mock",
    external_reference: externalReference,
    amount: total,
    status: "PENDING",
  });
  if (pErr) return { ok: false, error: "Impossible d'initialiser le paiement." };

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    accessToken: order.access_token,
    total,
    externalReference,
  };
}
