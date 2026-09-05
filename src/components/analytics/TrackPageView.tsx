"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackFunnelEvent } from "@/lib/analytics/track";

/* Monté une seule fois dans le layout racine — envoie PAGE_VIEW à chaque
   changement de route (navigation client incluse). */
export function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackFunnelEvent("PAGE_VIEW", { path: pathname });
  }, [pathname]);

  return null;
}
