import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { getProductBySlug } from "@/lib/catalog";
import { ProductBuyPanel } from "@/components/ProductBuyPanel";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { TrackProductView } from "@/components/analytics/TrackProductView";
import { formatXOF } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Modèle introuvable",
    };
  }

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      images: product.images?.[0]?.url
        ? [product.images[0].url]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const images = product.images ?? [];

  const inStock = (product.variants ?? []).some(
    (v) => v.stock > 0
  );

  const onPromo =
    !!product.compare_at_price &&
    product.compare_at_price > product.price;

  // Données structurées Product (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand ?? undefined,
    description: product.description ?? undefined,
    image: images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="on-product mx-auto max-w-app px-4 py-4 pb-24 sm:py-8 sm:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <TrackProductView productId={product.id} />

      {/* =================================================
          PRODUIT
          ================================================= */}
      <div className="grid gap-8 sm:grid-cols-2 sm:items-start">
        {/* Galerie + compte à rebours */}
        <ProductGallery
          images={product.images ?? []}
          name={product.name}
          productId={product.id}
          onPromo={onPromo}
        />

        {/* =================================================
            INFOS + ACHAT
            ================================================= */}
        <div className="min-w-0 sm:pt-2">
          {product.brand && (
            <div className="eyebrow">
              {product.brand}
            </div>
          )}

          <h1 className="display mt-1 text-3xl leading-tight sm:text-4xl">
            {product.name}
          </h1>

          {product.category && (
            <div className="mt-1 text-sm text-ink-faint">
              {product.category.name}
            </div>
          )}

          <div className="mt-6">
            <ProductBuyPanel product={product} />
          </div>

          {/* =================================================
              RÉASSURANCE PRODUIT
              ================================================= */}
          <div className="mt-6 grid grid-cols-1 gap-2 border-t border-paper-line pt-5 text-sm sm:grid-cols-3 sm:gap-3">
            <ReassuranceItem
              icon={<Truck />}
              label="Livraison"
              detail="Rapide, offerte"
              href="/livraison"
            />

            <ReassuranceItem
              icon={<ShieldCheck />}
              label="Paiement"
              detail="Mobile Money sécurisé"
            />

            <ReassuranceItem
              icon={<RotateCcw />}
              label="Retours"
              detail="Sous 7 jours"
              href="/retours"
            />
          </div>

          {/* =================================================
              DESCRIPTION
              ================================================= */}
          {product.description && (
            <div className="mt-6 border-t border-paper-line pt-6">
              <div className="eyebrow mb-2">
                Description
              </div>

              <p className="text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </div>
          )}

          {/* =================================================
              PRIX
              ================================================= */}
          <div className="mt-6 flex items-center justify-between border-t border-paper-line pt-4 text-sm">
            <span className="text-ink-faint">
              Prix
            </span>

            <span className="flex items-baseline gap-1.5">
              <span className="tech font-bold text-ink">
                {formatXOF(product.price)}
              </span>

              {onPromo && (
                <span className="tech text-xs text-ink-faint line-through">
                  {formatXOF(product.compare_at_price!)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}

function ReassuranceItem({
  icon,
  label,
  detail,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2.5 rounded-xl border border-paper-line bg-paper-soft px-3 py-2.5">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center text-ink"
        aria-hidden
      >
        {React.cloneElement(
          icon as React.ReactElement,
          {
            size: 18,
            strokeWidth: 1.8,
          }
        )}
      </span>

      <div className="min-w-0 leading-tight">
        <div className="font-medium text-ink">
          {label}
        </div>

        <div className="truncate text-xs text-ink-faint">
          {detail}
        </div>
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      className="block transition-opacity hover:opacity-80"
    >
      {content}
    </a>
  ) : (
    content
  );
}