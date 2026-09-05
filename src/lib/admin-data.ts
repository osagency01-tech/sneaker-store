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
    .select(
      "*, variants:product_variants(id, size, stock), category:categories(name), images:product_images(id, url, position)"
    )
    .order("created_at", { ascending: false });
  (data ?? []).forEach((p: any) => p.images?.sort((a: any, b: any) => a.position - b.position));
  return data ?? [];
}

/* Compteurs bruts du tunnel de conversion sur les N derniers jours —
   même table analytics_events que la route /api/track. */
export async function getFunnelStats(days = 30) {
  const db = createAdminClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await db
    .from("analytics_events")
    .select("event_type")
    .gte("created_at", since);

  if (error || !data) {
    return { available: false as const, pageViews: 0, productViews: 0, addToCart: 0, beginCheckout: 0, purchases: 0 };
  }

  const count = (t: string) => data.filter((r: any) => r.event_type === t).length;
  return {
    available: true as const,
    pageViews: count("PAGE_VIEW"),
    productViews: count("PRODUCT_VIEW"),
    addToCart: count("ADD_TO_CART"),
    beginCheckout: count("BEGIN_CHECKOUT"),
    purchases: count("PURCHASE"),
  };
}

/* Dernières sessions et leur étape la plus avancée — permet de repérer où
   les visiteurs décrochent (ex : ajout panier sans paiement) sans stocker
   de donnée personnelle, juste un identifiant de session technique. */
export async function getRecentSessions(limit = 15) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("analytics_events")
    .select("session_id, event_type, product_id, created_at, products(name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return { available: false as const, sessions: [] as any[] };

  const RANK: Record<string, number> = {
    PAGE_VIEW: 0, PRODUCT_VIEW: 1, ADD_TO_CART: 2, BEGIN_CHECKOUT: 3, PURCHASE: 4,
  };
  const LABEL: Record<string, string> = {
    PAGE_VIEW: "Visite", PRODUCT_VIEW: "Produit", ADD_TO_CART: "Panier",
    BEGIN_CHECKOUT: "Checkout", PURCHASE: "Achat",
  };

  const bySession = new Map<string, any>();
  for (const row of data as any[]) {
    const existing = bySession.get(row.session_id);
    if (!existing || RANK[row.event_type] > RANK[existing.event_type]) {
      bySession.set(row.session_id, row);
    }
  }

  const sessions = [...bySession.values()]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((r) => ({
      sessionId: r.session_id as string,
      stepLabel: LABEL[r.event_type] ?? r.event_type,
      productName: r.products?.name ?? null,
      time: r.created_at as string,
    }));

  return { available: true as const, sessions };
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
