import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { ProductBuyPanel } from "@/components/ProductBuyPanel";
import { ProductGallery } from "@/components/ProductGallery";
import { formatXOF } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Modèle introuvable" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const images = product.images ?? [];
  const inStock = (product.variants ?? []).some((v) => v.stock > 0);

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
        // échappe "<" pour empêcher une sortie de balise (ex: "</script>")
        // si un champ produit venait à contenir ce motif.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
        <ProductGallery images={images} name={product.name} />

        {/* Infos + achat */}
        <div className="min-w-0 sm:pt-2">
          {product.brand && <div className="eyebrow">{product.brand}</div>}
          <h1 className="display mt-1 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          {product.category && (
            <div className="mt-1 text-sm text-ink-faint">{product.category.name}</div>
          )}

          <div className="mt-6">
            <ProductBuyPanel product={product} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-paper-line pt-6">
              <div className="eyebrow mb-2">Description</div>
              <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-paper-line pt-4 text-sm">
            <span className="text-ink-faint">Prix</span>
            <span className="flex items-baseline gap-1.5">
              <span className="tech font-bold text-ink">{formatXOF(product.price)}</span>
              {!!product.compare_at_price && product.compare_at_price > product.price && (
                <span className="tech text-xs text-ink-faint line-through">
                  {formatXOF(product.compare_at_price)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
