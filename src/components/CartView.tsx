"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

export function CartView() {
  const { lines, subtotal, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-app px-4 py-20 text-center">
        <h1 className="display text-2xl">Votre panier est vide</h1>
        <p className="mt-2 text-ink-faint">Il attend une belle paire.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-pill bg-ink px-6 py-3 text-sm font-semibold text-paper"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const total = subtotal; // livraison gratuite

  return (
    <div className="mx-auto max-w-app px-4 py-6">
      <h1 className="display text-3xl">Panier</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Lignes */}
        <ul className="divide-y divide-paper-line">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-4 py-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-soft">
                {l.image && (
                  <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link href={`/product/${l.slug}`} className="font-display font-semibold leading-tight">
                    {l.name}
                  </Link>
                  <span className="tech text-sm">{formatXOF(l.price * l.quantity)}</span>
                </div>
                <div className="tech mt-0.5 text-xs text-ink-faint">Pointure {l.size}</div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-pill border border-paper-line">
                    <button
                      onClick={() => setQty(l.variantId, l.quantity - 1)}
                      className="px-3 py-1.5 text-lg leading-none"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="tech w-8 text-center text-sm">{l.quantity}</span>
                    <button
                      onClick={() => setQty(l.variantId, l.quantity + 1)}
                      className="px-3 py-1.5 text-lg leading-none"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(l.variantId)}
                    className="text-sm text-ink-faint hover:text-danger"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Résumé */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-card border border-paper-line bg-paper-soft p-5">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-ink-soft">Sous-total</span>
              <span className="tech">{formatXOF(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-ink-soft">Livraison</span>
              <span className="tech text-ok">Gratuite</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-paper-line pt-3">
              <span className="font-semibold">Total</span>
              <span className="tech text-lg">{formatXOF(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block rounded-pill bg-ink py-3.5 text-center text-sm font-semibold text-paper"
            >
              Commander
            </Link>
            <p className="mt-2 text-center text-xs text-ink-faint">
              Montant final vérifié à l'étape de paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
