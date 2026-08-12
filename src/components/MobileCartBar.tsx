"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

/* Barre fixe bas d'écran (mobile) : résumé + accès commander en un pouce. */
export function MobileCartBar() {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <div className="mobile-cart-bar fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
        <div className="leading-tight">
          <div className="eyebrow">{count} article{count > 1 ? "s" : ""}</div>
          <div className="tech text-sm">{formatXOF(subtotal)}</div>
        </div>
        <Link
          href="/cart"
          className="ml-auto rounded-pill bg-ink px-6 py-2.5 text-sm font-semibold text-paper"
        >
          Voir le panier
        </Link>
      </div>
    </div>
  );
}
