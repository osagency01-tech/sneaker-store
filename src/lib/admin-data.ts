/* Lectures back-office — service_role (contourne RLS). Réservé aux
   pages admin déjà protégées par le layout. */

import { createAdminClient } from "@/lib/supabase/admin";

/* ========================================================================== */
/* DASHBOARD                                                                  */
/* ========================================================================== */

export async function getDashboardStats() {
  const db = createAdminClient();

  const [
    { data: paidOrders },
    { count: totalOrders },
    { count: products },
    { data: lowStock },
  ] = await Promise.all([
    db
      .from("orders")
      .select("total, status")
      .in("status", ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]),

    db
      .from("orders")
      .select("*", { count: "exact", head: true }),

    db
      .from("products")
      .select("*", { count: "exact", head: true }),

    db
      .from("product_variants")
      .select("size, stock, products(name)")
      .lte("stock", 2)
      .order("stock"),
  ]);

  const revenue = (paidOrders ?? []).reduce(
    (sum, order: any) => sum + Number(order.total ?? 0),
    0
  );

  return {
    revenue,
    paidCount: paidOrders?.length ?? 0,
    totalOrders: totalOrders ?? 0,
    products: products ?? 0,
    lowStock: (lowStock ?? []) as any[],
  };
}

/* ========================================================================== */
/* COMMANDES                                                                  */
/* ========================================================================== */

export async function getRecentOrders(limit = 10) {
  const db = createAdminClient();

  const { data } = await db
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, customer:customers(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getAllOrders() {
  const db = createAdminClient();

  const { data } = await db
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, customer:customers(full_name, phone)"
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getOrderDetail(id: string) {
  const db = createAdminClient();

  const { data } = await db
    .from("orders")
    .select(
      "*, items:order_items(*), customer:customers(*), payment:payments(*)"
    )
    .eq("id", id)
    .single();

  return data;
}

/* ========================================================================== */
/* PRODUITS                                                                   */
/* ========================================================================== */

export async function getAllProducts() {
  const db = createAdminClient();

  const { data } = await db
    .from("products")
    .select(
      "*, variants:product_variants(id, size, stock), category:categories(name), images:product_images(id, url, position)"
    )
    .order("created_at", { ascending: false });

  (data ?? []).forEach((product: any) => {
    product.images?.sort(
      (a: any, b: any) => a.position - b.position
    );
  });

  return data ?? [];
}

/* ========================================================================== */
/* ANALYTICS — TUNNEL                                                         */
/* ========================================================================== */

/**
 * Statistiques du tunnel sur les N derniers jours.
 *
 * IMPORTANT :
 * - pageViews = nombre total de pages vues
 * - visitors = nombre de sessions uniques
 * - productViews = nombre d'événements PRODUCT_VIEW
 * - addToCart = nombre d'événements ADD_TO_CART
 * - beginCheckout = nombre d'événements BEGIN_CHECKOUT
 * - purchases = nombre d'événements PURCHASE
 *
 * On ne confond donc plus "pages vues" avec "visiteurs".
 */
export async function getFunnelStats(days = 30) {
  const db = createAdminClient();

  const since = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  const { data, error } = await db
    .from("analytics_events")
    .select("session_id, event_type, product_id, path, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return {
      available: false as const,
      visitors: 0,
      pageViews: 0,
      productViews: 0,
      addToCart: 0,
      beginCheckout: 0,
      purchases: 0,
      cartWithoutPurchase: 0,
      checkoutWithoutPurchase: 0,
      visitToPurchaseRate: 0,
      cartToPurchaseRate: 0,
      checkoutToPurchaseRate: 0,
    };
  }

  const rows = data as any[];

  const sessions = new Set<string>();
  const cartSessions = new Set<string>();
  const checkoutSessions = new Set<string>();
  const purchaseSessions = new Set<string>();

  let pageViews = 0;
  let productViews = 0;
  let addToCart = 0;
  let beginCheckout = 0;
  let purchases = 0;

  for (const row of rows) {
    if (row.session_id) {
      sessions.add(row.session_id);
    }

    switch (row.event_type) {
      case "PAGE_VIEW":
        pageViews++;
        break;

      case "PRODUCT_VIEW":
        productViews++;
        break;

      case "ADD_TO_CART":
        addToCart++;
        if (row.session_id) {
          cartSessions.add(row.session_id);
        }
        break;

      case "BEGIN_CHECKOUT":
        beginCheckout++;
        if (row.session_id) {
          checkoutSessions.add(row.session_id);
        }
        break;

      case "PURCHASE":
        purchases++;
        if (row.session_id) {
          purchaseSessions.add(row.session_id);
        }
        break;
    }
  }

  const visitors = sessions.size;

  const cartWithoutPurchase = [...cartSessions].filter(
    (sessionId) => !purchaseSessions.has(sessionId)
  ).length;

  const checkoutWithoutPurchase = [...checkoutSessions].filter(
    (sessionId) => !purchaseSessions.has(sessionId)
  ).length;

  const visitToPurchaseRate =
    visitors > 0
      ? Math.round((purchaseSessions.size / visitors) * 100)
      : 0;

  const cartToPurchaseRate =
    cartSessions.size > 0
      ? Math.round((purchaseSessions.size / cartSessions.size) * 100)
      : 0;

  const checkoutToPurchaseRate =
    checkoutSessions.size > 0
      ? Math.round(
          (purchaseSessions.size / checkoutSessions.size) * 100
        )
      : 0;

  return {
    available: true as const,

    visitors,
    pageViews,
    productViews,
    addToCart,
    beginCheckout,
    purchases,

    cartWithoutPurchase,
    checkoutWithoutPurchase,

    visitToPurchaseRate,
    cartToPurchaseRate,
    checkoutToPurchaseRate,
  };
}

/* ========================================================================== */
/* ANALYTICS — SESSIONS                                                       */
/* ========================================================================== */

/**
 * Récupère les sessions récentes et reconstruit leur parcours.
 *
 * Pour chaque session :
 * - première visite
 * - dernière activité
 * - nombre de pages vues
 * - pages parcourues
 * - produit consulté
 * - dernière page
 * - dernière étape atteinte
 * - nombre d'ajouts panier
 * - checkout commencé
 * - achat effectué
 */
export async function getRecentSessions(limit = 30) {
  const db = createAdminClient();

  /*
   * On récupère suffisamment d'événements pour reconstruire les sessions.
   * On ne limite pas directement à "15 lignes", car une session peut
   * contenir plusieurs pages.
   */
  const { data, error } = await db
    .from("analytics_events")
    .select(
      "session_id, event_type, product_id, path, created_at, products(name)"
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error || !data) {
    return {
      available: false as const,
      sessions: [] as any[],
    };
  }

  const rows = data as any[];

  const RANK: Record<string, number> = {
    PAGE_VIEW: 0,
    PRODUCT_VIEW: 1,
    ADD_TO_CART: 2,
    BEGIN_CHECKOUT: 3,
    PURCHASE: 4,
  };

  const LABEL: Record<string, string> = {
    PAGE_VIEW: "Visite",
    PRODUCT_VIEW: "Produit",
    ADD_TO_CART: "Panier",
    BEGIN_CHECKOUT: "Checkout",
    PURCHASE: "Achat",
  };

  /*
   * Une entrée complète par session.
   */
  const bySession = new Map<string, any>();

  for (const row of rows) {
    if (!row.session_id) continue;

    let session = bySession.get(row.session_id);

    if (!session) {
      session = {
        sessionId: row.session_id,

        firstSeen: row.created_at,
        lastSeen: row.created_at,

        eventCount: 0,
        pageViews: 0,

        paths: [],
        uniquePaths: new Set<string>(),

        productIds: new Set<string>(),
        productNames: new Set<string>(),

        addToCart: 0,
        beginCheckout: 0,
        purchase: 0,

        highestEvent: row.event_type,
        highestRank: RANK[row.event_type] ?? 0,

        lastPath: row.path ?? null,
        lastEvent: row.event_type,
        lastProductName: row.products?.name ?? null,
      };

      bySession.set(row.session_id, session);
    }

    session.eventCount++;

    const eventTime = new Date(row.created_at).getTime();
    const firstTime = new Date(session.firstSeen).getTime();
    const lastTime = new Date(session.lastSeen).getTime();

    if (eventTime < firstTime) {
      session.firstSeen = row.created_at;
    }

    if (eventTime > lastTime) {
      session.lastSeen = row.created_at;
      session.lastPath = row.path ?? null;
      session.lastEvent = row.event_type;
      session.lastProductName = row.products?.name ?? null;
    }

    if (row.event_type === "PAGE_VIEW") {
      session.pageViews++;
    }

    if (row.path) {
      session.paths.push(row.path);
      session.uniquePaths.add(row.path);
    }

    if (row.product_id) {
      session.productIds.add(row.product_id);
    }

    if (row.products?.name) {
      session.productNames.add(row.products.name);
    }

    if (row.event_type === "ADD_TO_CART") {
      session.addToCart++;
    }

    if (row.event_type === "BEGIN_CHECKOUT") {
      session.beginCheckout++;
    }

    if (row.event_type === "PURCHASE") {
      session.purchase++;
    }

    const rank = RANK[row.event_type] ?? 0;

    if (rank > session.highestRank) {
      session.highestRank = rank;
      session.highestEvent = row.event_type;
    }
  }

  const sessions = [...bySession.values()]
    .sort(
      (a, b) =>
        new Date(b.lastSeen).getTime() -
        new Date(a.lastSeen).getTime()
    )
    .slice(0, limit)
    .map((session) => {
      const first = new Date(session.firstSeen).getTime();
      const last = new Date(session.lastSeen).getTime();

      const durationSeconds = Math.max(
        0,
        Math.round((last - first) / 1000)
      );

      const durationMinutes = Math.floor(durationSeconds / 60);
      const durationRemainingSeconds = durationSeconds % 60;

      let durationLabel = `${durationSeconds}s`;

      if (durationMinutes > 0) {
        durationLabel = `${durationMinutes}m ${durationRemainingSeconds}s`;
      }

      return {
        sessionId: session.sessionId,

        firstSeen: session.firstSeen,
        lastSeen: session.lastSeen,

        time: session.lastSeen,

        eventCount: session.eventCount,
        pageViews: session.pageViews,

        paths: session.paths,
        uniquePaths: [...session.uniquePaths],

        pagesCount: session.uniquePaths.size,

        lastPath: session.lastPath,

        productName:
          [...session.productNames][0] ?? null,

        productNames:
          [...session.productNames],

        productIds:
          [...session.productIds],

        addToCart: session.addToCart,
        beginCheckout: session.beginCheckout,
        purchase: session.purchase,

        purchased: session.purchase > 0,

        abandonedCart:
          session.addToCart > 0 &&
          session.purchase === 0,

        abandonedCheckout:
          session.beginCheckout > 0 &&
          session.purchase === 0,

        step: session.highestEvent,
        stepLabel:
          LABEL[session.highestEvent] ??
          session.highestEvent,

        durationSeconds,
        durationLabel,
      };
    });

  return {
    available: true as const,
    sessions,
  };
}

/* ========================================================================== */
/* ANALYTICS — PAGES                                                         */
/* ========================================================================== */

/**
 * Pages qui génèrent le plus de visites.
 *
 * Permet notamment de voir quelles pages attirent les visiteurs.
 */
export async function getAnalyticsPages(days = 30) {
  const db = createAdminClient();

  const since = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  const { data, error } = await db
    .from("analytics_events")
    .select("session_id, event_type, path, created_at")
    .eq("event_type", "PAGE_VIEW")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      available: false as const,
      pages: [] as any[],
    };
  }

  const byPath = new Map<
    string,
    {
      path: string;
      views: number;
      visitors: Set<string>;
      lastSeen: string;
    }
  >();

  for (const row of data as any[]) {
    const path = row.path || "/";

    let page = byPath.get(path);

    if (!page) {
      page = {
        path,
        views: 0,
        visitors: new Set<string>(),
        lastSeen: row.created_at,
      };

      byPath.set(path, page);
    }

    page.views++;

    if (row.session_id) {
      page.visitors.add(row.session_id);
    }

    if (
      new Date(row.created_at).getTime() >
      new Date(page.lastSeen).getTime()
    ) {
      page.lastSeen = row.created_at;
    }
  }

  const pages = [...byPath.values()]
    .sort((a, b) => b.views - a.views)
    .map((page) => ({
      path: page.path,
      views: page.views,
      visitors: page.visitors.size,
      lastSeen: page.lastSeen,
    }));

  return {
    available: true as const,
    pages,
  };
}

/* ========================================================================== */
/* ANALYTICS — PRODUITS                                                       */
/* ========================================================================== */

/**
 * Produits qui reçoivent le plus de vues et d'ajouts panier.
 */
export async function getAnalyticsProducts(days = 30) {
  const db = createAdminClient();

  const since = new Date(
    Date.now() - days * 86_400_000
  ).toISOString();

  const { data, error } = await db
    .from("analytics_events")
    .select(
      "session_id, event_type, product_id, created_at, products(name)"
    )
    .in("event_type", [
      "PRODUCT_VIEW",
      "ADD_TO_CART",
      "PURCHASE",
    ])
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      available: false as const,
      products: [] as any[],
    };
  }

  const byProduct = new Map<
    string,
    {
      productId: string;
      name: string;
      views: number;
      visitors: Set<string>;
      addToCart: number;
      purchases: number;
    }
  >();

  for (const row of data as any[]) {
    if (!row.product_id) continue;

    const id = row.product_id;

    let product = byProduct.get(id);

    if (!product) {
      product = {
        productId: id,
        name: row.products?.name ?? "Produit",
        views: 0,
        visitors: new Set<string>(),
        addToCart: 0,
        purchases: 0,
      };

      byProduct.set(id, product);
    }

    if (row.event_type === "PRODUCT_VIEW") {
      product.views++;

      if (row.session_id) {
        product.visitors.add(row.session_id);
      }
    }

    if (row.event_type === "ADD_TO_CART") {
      product.addToCart++;
    }

    if (row.event_type === "PURCHASE") {
      product.purchases++;
    }
  }

  const products = [...byProduct.values()]
    .sort((a, b) => b.views - a.views)
    .map((product) => ({
      productId: product.productId,
      name: product.name,
      views: product.views,
      visitors: product.visitors.size,
      addToCart: product.addToCart,
      purchases: product.purchases,

      cartRate:
        product.views > 0
          ? Math.round(
              (product.addToCart / product.views) * 100
            )
          : 0,

      purchaseRate:
        product.views > 0
          ? Math.round(
              (product.purchases / product.views) * 100
            )
          : 0,
    }));

  return {
    available: true as const,
    products,
  };
}

/* ========================================================================== */
/* CLIENTS                                                                    */
/* ========================================================================== */

export async function getAllCustomers() {
  const db = createAdminClient();

  const { data } = await db
    .from("customers")
    .select("*, orders(id)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

/* ========================================================================== */
/* RELANCES                                                                   */
/* ========================================================================== */

export async function getAbandonedOrders() {
  /*
   * Commandes restées en attente de paiement.
   *
   * On attend 10 minutes afin de ne pas relancer quelqu'un qui est simplement
   * en train de terminer son paiement.
   */

  const db = createAdminClient();

  const cutoff = new Date(
    Date.now() - 10 * 60_000
  ).toISOString();

  const { data } = await db
    .from("orders")
    .select(
      "id, order_number, total, created_at, customer:customers(full_name, phone, email, country)"
    )
    .eq("status", "PENDING_PAYMENT")
    .lte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}