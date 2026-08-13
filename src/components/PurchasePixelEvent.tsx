"use client";

import { useEffect } from "react";
import { trackPixelEvent } from "@/lib/meta-pixel";

type Item = {
  productId: string | null;
  quantity: number;
  unitPrice: number;
};

/* Déclenche l'événement Purchase du Meta Pixel une seule fois par
   commande — même si la page de confirmation est rechargée (un simple
   F5 sur ?paid=1 ne doit pas compter deux fois la même vente). */
export function PurchasePixelEvent({
  orderId,
  orderNumber,
  total,
  items,
}: {
  orderId: string;
  orderNumber: string;
  total: number;
  items: Item[];
}) {
  useEffect(() => {
    const key = `vantom.purchase_tracked.${orderId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* localStorage indisponible (navigation privée…) — on tracke quand même,
         pas de garde anti-doublon possible dans ce cas, tant pis. */
    }
    trackPixelEvent("Purchase", {
      value: total,
      currency: "XOF",
      content_type: "product",
      content_ids: items.map((i) => i.productId).filter(Boolean),
      contents: items.map((i) => ({ id: i.productId, quantity: i.quantity, item_price: i.unitPrice })),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      order_id: orderNumber,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
