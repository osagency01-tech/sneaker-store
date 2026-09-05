"use client";

/* Tunnel de conversion — événements anonymes (PAGE_VIEW, PRODUCT_VIEW,
   ADD_TO_CART, BEGIN_CHECKOUT, PURCHASE) envoyés à /api/track, qui les
   stocke dans analytics_events pour le tableau de bord admin.
   Distinct du Meta Pixel (src/lib/meta-pixel.ts) : ne le remplace pas,
   ne doit jamais bloquer ou dupliquer son comportement. Ne jamais laisser
   le tracking faire échouer une action utilisateur. */

const SID_KEY = "vantom.sid";

function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "no-storage";
  }
}

export type FunnelEvent = "PAGE_VIEW" | "PRODUCT_VIEW" | "ADD_TO_CART" | "BEGIN_CHECKOUT" | "PURCHASE";

export function trackFunnelEvent(event: FunnelEvent, params?: { productId?: string | null; path?: string }) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      sessionId: getSessionId(),
      eventType: event,
      productId: params?.productId ?? null,
      path: params?.path ?? window.location.pathname,
    });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* le tracking ne doit jamais faire échouer le parcours d'achat */
  }
}
