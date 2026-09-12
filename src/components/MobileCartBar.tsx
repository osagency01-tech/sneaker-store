"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

export function MobileCartBar() {
  const { count, subtotal } = useCart();
  const pathname = usePathname();

  const [isPaymentStep, setIsPaymentStep] =
    useState(false);

  useEffect(() => {
    function handleCheckoutStep(event: Event) {
      const customEvent =
        event as CustomEvent<{
          payment: boolean;
        }>;

      setIsPaymentStep(
        customEvent.detail?.payment === true
      );
    }

    window.addEventListener(
      "vantom:checkout-step",
      handleCheckoutStep
    );

    return () => {
      window.removeEventListener(
        "vantom:checkout-step",
        handleCheckoutStep
      );
    };
  }, []);

  if (count === 0) return null;

  const showPaymentButton =
    pathname === "/checkout" &&
    isPaymentStep;

  function handlePay() {
    if (!showPaymentButton) return;

    window.dispatchEvent(
      new Event("vantom:pay")
    );
  }

  return (
    <div className="mobile-cart-bar fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
        <div className="leading-tight">
          <div className="eyebrow">
            {count} article{count > 1 ? "s" : ""}
          </div>

          <div className="tech text-sm">
            {formatXOF(subtotal)}
          </div>
        </div>

        {showPaymentButton ? (
          <button
            type="button"
            onClick={handlePay}
            className="ml-auto rounded-pill bg-[#1F7955] px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 animate-vantom-cta"
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