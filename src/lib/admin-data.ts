/* Lectures back-office — service_role (contourne RLS). Réservé aux
   pages admin déjà protégées par le layout. */
import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardStats() {
  const db = createAdminClient();
  const [{ data: paidOrders }, { count: totalOrders }, { count: products }, { data: lowStock }] =
    await Promise.all([
      db.from("orders").select("total, status").in("status", ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]),
      db.from("orders").select("*", { count: "exact", head: true }),
      db.from("products").select("*", { count: "exact", head: true }),
      db.from("product_variants").select("size, stock, products(name)").lte("stock", 2).order("stock"),
    ]);

  const revenue = (paidOrders ?? []).reduce((s, o: any) => s + o.total, 0);
  return {
    revenue,
    paidCount: paidOrders?.length ?? 0,
    totalOrders: totalOrders ?? 0,
    products: products ?? 0,
    lowStock: (lowStock ?? []) as any[],
  };
}

export async function getRecentOrders(limit = 10) {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, status, total, created_at, customer:customers(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllOrders() {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, status, total, created_at, customer:customers(full_name, phone)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOrderDetail(id: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("*, items:order_items(*), customer:customers(*), payment:payments(*)")
    .eq("id", id)
    .single();
  return data;
}

export async function getAllProducts() {
  const db = createAdminClient();
  const { data } = await db
    .from("products")
    .select("*, variants:product_variants(id, size, stock), category:categories(name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllCustomers() {
  const db = createAdminClient();
  const { data } = await db
    .from("customers")
    .select("*, orders(id)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAbandonedOrders() {
  /* Commandes restées en attente de paiement — le client a renseigné ses
     coordonnées (nom + WhatsApp) mais n'a pas finalisé. Récupérables pour
     relance commerciale. On exclut les toutes dernières minutes (paiement
     peut-être en cours). */
  const db = createAdminClient();
  const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data } = await db
    .from("orders")
    .select("id, order_number, total, created_at, customer:customers(full_name, phone, email, country)")
    .eq("status", "PENDING_PAYMENT")
    .lte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}
