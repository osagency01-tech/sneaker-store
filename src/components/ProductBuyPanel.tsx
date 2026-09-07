"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductWithRelations } from "@/types/db";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";
import { trackPixelEvent } from "@/lib/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics/track";

const WHATSAPP_NUMBER = "2250161853443";

export function ProductBuyPanel({
  product,
}: {
  product: ProductWithRelations;
}) {
  const { add } = useCart();
  const router = useRouter();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const variants = product.variants ?? [];
  const selected = variants.find((v) => v.id === variantId);

  // Les sacs n'ont pas besoin de sélection de variante.
  const isBag =
    product.category?.slug === "sacs" ||
    product.slug === "sac-couleur" ||
    product.slug === "sac-motif";

  const onPromo =
    !!product.compare_at_price &&
    product.compare_at_price > product.price;

  const discountPct = onPromo
    ? Math.round(
        (1 - product.price / product.compare_at_price!) * 100
      )
    : 0;

  function handleAdd(goToCheckout: boolean) {
    /*
     * SAC :
     * Pas de sélection de pointure/couleur/motif.
     * On ajoute directement le produit au panier.
     */
    if (isBag) {
      const bagVariant = variants[0];

      // Sécurité : le produit doit avoir au moins une variante en base.
      if (!bagVariant || bagVariant.stock <= 0) return;

      add({
        productId: product.id,
        variantId: bagVariant.id,
        slug: product.slug,
        name: product.name,
        size: "",
        price: product.price,
        image: product.images?.[0]?.url ?? null,
        quantity: 1,
      });

      trackPixelEvent("AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price,
        currency: "XOF",
        contents: [
          {
            id: product.id,
            quantity: 1,
            item_price: product.price,
          },
        ],
      });

      trackFunnelEvent("ADD_TO_CART", {
        productId: product.id,
      });

      if (goToCheckout) {
        router.push("/checkout");
      } else {
        setAdded(true);

        setTimeout(() => {
          setAdded(false);
        }, 1800);
      }

      return;
    }

    /*
     * SNEAKERS :
     * Une pointure doit être sélectionnée.
     */
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

    trackPixelEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "XOF",
      contents: [
        {
          id: product.id,
          quantity: 1,
          item_price: product.price,
        },
      ],
    });

    trackFunnelEvent("ADD_TO_CART", {
      productId: product.id,
    });

    if (goToCheckout) {
      router.push("/checkout");
    } else {
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    }
  }

  function contactSeller() {
    // Pour les sneakers, la pointure doit être choisie.
    if (!isBag && !selected) {
      return;
    }

    const size =
      !isBag && selected
        ? ` — Pointure ${selected.size}`
        : "";

    const message = `Bonjour, je souhaite commander ${product.name}${size} au prix de ${formatXOF(
      product.price
    )}. Je souhaite effectuer le paiement avec le vendeur.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const canPurchase = isBag || !!selected;

  return (
    <div>
      {/* Prix */}
      <div className="flex flex-wrap items-baseline gap-2.5">
        <div className="tech text-3xl font-bold text-ink">
          {formatXOF(product.price)}
        </div>

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

      {/* ================================
          POINTURE UNIQUEMENT POUR SNEAKERS
          ================================ */}
      {!isBag && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">
              Pointure
            </span>

            {selected &&
              selected.stock > 0 &&
              selected.stock <= 3 && (
                <span className="text-xs text-warn">
                  Plus que {selected.stock}
                </span>
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
      )}

      {/* Actions desktop / tablette */}
      <div className="mt-6 hidden gap-3 sm:flex">
        {/* Paiement avec vendeur */}
        <button
          type="button"
          onClick={contactSeller}
          disabled={!canPurchase}
          className="flex-1 rounded-pill border border-ink bg-paper py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>💬</span>{" "}
          Payer avec le vendeur
        </button>

        {/* Paiement classique */}
        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={!canPurchase}
          className="flex-1 rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Acheter
        </button>
      </div>

      {/* Message de sélection uniquement pour les sneakers */}
      {!isBag && !selected && (
        <p className="mt-3 hidden text-center text-xs text-ink-faint sm:block">
          Choisissez une pointure pour continuer.
        </p>
      )}

      {/* Barre d'achat COLLANTE mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 px-4 py-3.5 backdrop-blur-md sm:hidden">
        <div className="mx-auto max-w-app">
          {/* Prix + pointure */}
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <div className="tech text-base font-bold text-ink">
                {formatXOF(product.price)}
              </div>

              {onPromo && (
                <div className="tech text-xs text-ink-faint line-through">
                  {formatXOF(product.compare_at_price!)}
                </div>
              )}
            </div>

            {!isBag && selected && (
              <div className="eyebrow shrink-0">
                Pointure {selected.size}
              </div>
            )}
          </div>

          {/* Deux méthodes de paiement */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={contactSeller}
              disabled={!canPurchase}
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-pill border border-ink bg-paper px-3 py-3 text-center text-xs font-semibold leading-tight text-ink transition-colors hover:bg-paper-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden>💬</span>
              <span>Payer avec le vendeur</span>
            </button>

            <button
              type="button"
              onClick={() => handleAdd(true)}
              disabled={!canPurchase}
              className="flex min-h-12 items-center justify-center rounded-pill bg-ink px-3 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Commander
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}