"use client";

import { useEffect, useRef } from "react";
import { trackFunnelEvent } from "@/lib/analytics/track";

export function TrackProductView({ productId }: { productId: string }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackFunnelEvent("PRODUCT_VIEW", { productId });
  }, [productId]);

  return null;
}
