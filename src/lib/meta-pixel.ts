declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/* Envoie un événement au Meta Pixel s'il est chargé — silencieux si le
   pixel est désactivé (NEXT_PUBLIC_META_PIXEL_ID absent) ou bloqué
   côté navigateur. Ne jamais laisser un tracking planter une action
   utilisateur (ajout panier, paiement…). */
export function trackPixelEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    /* le tracking ne doit jamais faire échouer le parcours d'achat */
  }
}
