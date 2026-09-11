"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3 } from "lucide-react";
import type { ProductWithRelations } from "@/types/db";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";
import { trackPixelEvent } from "@/lib/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics/track";

export function ProductBuyPanel({
  product,
}: {
  product: ProductWithRelations;
}) {
  const { add } = useCart();
  const router = useRouter();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const [promoRemaining, setPromoRemaining] = useState<number | null>(null);

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

  /*
   * COMPTE À REBOURS PROMOTION
   *
   * Le délai de 24h est conservé sur l'appareil du visiteur.
   * Il ne redémarre pas à chaque actualisation de la page.
   */
  useEffect(() => {
    if (!onPromo) {
      setPromoRemaining(null);
      return;
    }

    const storageKey = `vantom-promo-end-${product.id}`;

    let endTime = Number(localStorage.getItem(storageKey));

    // Première visite : création du délai de 24h.
    if (!Number.isFinite(endTime)) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(storageKey, String(endTime));
    }

    // Promotion déjà terminée.
    if (endTime <= Date.now()) {
      localStorage.removeItem(storageKey);
      setPromoRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        setPromoRemaining(0);
        localStorage.removeItem(storageKey);
        return;
      }

      setPromoRemaining(remaining);
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [onPromo, product.id]);

  function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

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
            <span className="eyebrow">Pointure</span>

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
        <button
          type="button"
          onClick={() => handleAdd(false)}
          disabled={!isBag && !selected}
          className="flex-1 rounded-pill border border-ink py-3.5 text-sm font-semibold disabled:opacity-40"
        >
          {added ? "Ajouté ✓" : "Ajouter au panier"}
        </button>

        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={!isBag && !selected}
          className="flex-1 rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-40"
        >
          Acheter
        </button>
      </div>

      {/* ================================
          COMPTE À REBOURS PROMOTION
          À LA PLACE DU SECOND BLOC SUPPRIMÉ
          ================================ */}
      {onPromo &&
        promoRemaining !== null &&
        promoRemaining > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            <div className="flex items-center gap-2">
              <Clock3
                size={18}
                strokeWidth={2.2}
                className="shrink-0"
              />

              <span className="text-xs font-semibold sm:text-sm">
                Fin de la promotion
              </span>
            </div>

            <span className="tech text-base font-bold tracking-wide sm:text-lg">
              {formatCountdown(promoRemaining)}
            </span>
          </div>
        )}

      {/* Message de sélection uniquement pour les sneakers */}
      {!isBag && !selected && (
        <p className="mt-3 hidden text-center text-xs text-ink-faint sm:block">
          Choisissez une pointure pour continuer.
        </p>
      )}

      {/* Barre d'achat COLLANTE mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-app items-center gap-3">
          <div className="leading-tight">
            <div className="eyebrow">
              {isBag
                ? "Prix"
                : selected
                  ? `Pointure ${selected.size}`
                  : "Prix"}
            </div>

            <div className="flex items-baseline gap-1.5">
              <div className="tech text-base font-bold text-ink">
                {formatXOF(product.price)}
              </div>

              {onPromo && (
                <div className="tech text-xs text-ink-faint line-through">
                  {formatXOF(product.compare_at_price!)}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAdd(true)}
            disabled={!isBag && !selected}
            className="ml-auto flex-1 rounded-pill bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-40"
          >
            {isBag
              ? "Commander"
              : !selected
                ? "Choisir une pointure"
                : "Commander"}
          </button>
        </div>
      </div>
    </div>
  );
}