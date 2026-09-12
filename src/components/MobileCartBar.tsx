"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

/* ==================================================================== *
 * Barre fixe bas d'écran (mobile)
 *
 * Pages normales :
 *   → Voir le panier
 *
 * Page /checkout :
 *   → Payer et confirmer ma commande
 *
 * Le bouton de paiement déclenche le pay() du CheckoutFlow
 * via l'événement personnalisé "vantom:pay".
 * ==================================================================== */

export function MobileCartBar() {
  const { count, subtotal } = useCart();
  const pathname = usePathname();

  if (count === 0) return null;

  const isCheckout = pathname === "/checkout";

  function handlePay() {
    if (!isCheckout) return;

    window.dispatchEvent(
      new Event("vantom:pay")
    );
  }

  return (
    <div className="mobile-cart-bar fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
        {/* ---------------------------------------------------------- *
         *  Résumé
         * ---------------------------------------------------------- */}

        <div className="leading-tight">
          <div className="eyebrow">
            {count} article{count > 1 ? "s" : ""}
          </div>

          <div className="tech text-sm">
            {formatXOF(subtotal)}
          </div>
        </div>

        {/* ---------------------------------------------------------- *
         *  ACTION
         * ---------------------------------------------------------- */}

        {isCheckout ? (
          <button
            type="button"
            onClick={handlePay}
            className="ml-auto rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-transform duration-200 animate-vantom-cta"
          >
            Payer et confirmer ma commande
          </button>
        ) : (
          <Link
            href="/cart"
            className="ml-auto rounded-pill bg-ink px-6 py-2.5 text-sm font-semibold text-paper"
          >
            Voir le panier
          </Link>
        )}
      </div>
    </div>
  );
}