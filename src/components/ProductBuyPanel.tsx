"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductWithRelations } from "@/types/db";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

export function ProductBuyPanel({ product }: { product: ProductWithRelations }) {
  const { add } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const variants = product.variants ?? [];
  const selected = variants.find((v) => v.id === variantId);
  const onPromo = !!product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = onPromo
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  function handleAdd(goToCheckout: boolean) {
    if (!selected || selected.stock <= 0) return;
    add({
      productId: product.id,
      variantId: selected.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      price: product.price,
      image: product.images?.[0]?.url ?? null,
      quantity: 1,
    });
    // "Acheter" saute la page panier : achat direct vers le tunnel de commande.
    if (goToCheckout) router.push("/checkout");
    else { setAdded(true); setTimeout(() => setAdded(false), 1800); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <div className="tech text-3xl font-bold text-ink">{formatXOF(product.price)}</div>
        {onPromo && (
          <>
            <span className="tech text-lg text-ink-faint line-through">
              {formatXOF(product.compare_at_price!)}
            </span>
            <span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-paper">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      {/* Pointures — zones tactiles ≥44px */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Pointure</span>
          {selected && selected.stock > 0 && selected.stock <= 3 && (
            <span className="text-xs text-warn">Plus que {selected.stock}</span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {variants.map((v) => {
            const disabled = v.stock <= 0;
            const isSel = v.id === variantId;
            return (
              <button
                key={v.id}
                type="button"
                disabled={disabled}
                onClick={() => setVariantId(v.id)}
                className={[
                  "tech flex h-12 items-center justify-center rounded-xl border text-sm transition-colors",
                  disabled
                    ? "cursor-not-allowed border-paper-line text-ink-faint line-through opacity-40"
                    : isSel
                      ? "border-ink bg-ink text-paper"
                      : "border-paper-line hover:border-ink active:scale-95",
                ].join(" ")}
                aria-pressed={isSel}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions desktop / tablette */}
      <div className="mt-6 hidden gap-3 sm:flex">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          disabled={!selected}
          className="flex-1 rounded-pill border border-ink py-3.5 text-sm font-semibold disabled:opacity-40"
        >
          {added ? "Ajouté ✓" : "Ajouter au panier"}
        </button>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={!selected}
          className="flex-1 rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-40"
        >
          Acheter
        </button>
      </div>
      {!selected && (
        <p className="mt-3 hidden text-center text-xs text-ink-faint sm:block">
          Choisissez une pointure pour continuer.
        </p>
      )}

      {/* Barre d'achat COLLANTE mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-app items-center gap-3">
          <div className="leading-tight">
            <div className="eyebrow">{selected ? `Pointure ${selected.size}` : "Prix"}</div>
            <div className="flex items-baseline gap-1.5">
              <div className="tech text-base font-bold text-ink">{formatXOF(product.price)}</div>
              {onPromo && (
                <div className="tech text-xs text-ink-faint line-through">
                  {formatXOF(product.compare_at_price!)}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAdd(false)}
            disabled={!selected}
            className="ml-auto flex-1 rounded-pill bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-40"
          >
            {!selected ? "Choisir une pointure" : added ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </div>
  );
}
