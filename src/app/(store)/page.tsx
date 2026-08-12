import Link from "next/link";
import { getProducts, getCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { HeroSneaker } from "@/components/HeroSneaker";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const hero = products[0];
  const rest = products.slice(1);
  const heroImg = hero?.images?.[0]?.url ?? null;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden hero-haze">
        <div className="mx-auto grid max-w-app items-center gap-4 px-4 pb-24 pt-8 sm:pb-28 sm:pt-14 lg:grid-cols-2">
          {/* Texte */}
          <div className="relative z-10 animate-fadeUp">
            <div className="eyebrow text-accent-ink">Sneaker premium · confort ultime</div>
            <h1 className="display mt-3 text-5xl text-ink sm:text-6xl lg:text-7xl">
              Marque ton pas.
              <br />
              Garde ta foulée.
            </h1>
            <p className="mt-5 max-w-md text-ink-soft">
              Une sélection pointue de sneakers, boots et pièces designer. Choisis, paie au Mobile
              Money, reçois. Sans compte.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/shop"
                className="btn-offset rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-paper"
              >
                Découvrir
              </Link>
              {hero && (
                <Link
                  href={`/product/${hero.slug}`}
                  className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Le modèle du moment →
                </Link>
              )}
            </div>
          </div>

          {/* Sneaker flottante */}
          <div className="relative h-[300px] sm:h-[420px] lg:h-[480px]">
            {hero ? (
              <Link
                href={`/product/${hero.slug}`}
                aria-label={hero.name}
                className="block h-full w-full cursor-pointer"
              >
                <HeroSneaker src={heroImg} alt={hero.name} />
              </Link>
            ) : (
              <HeroSneaker src={heroImg} alt="Sneaker Vantom" />
            )}
          </div>
        </div>

        {/* Coup de pinceau blanc en bas */}
        <div className="brush-edge absolute inset-x-0 bottom-0 h-10 bg-paper" />
      </section>

      {/* ============ CARROUSEL PRODUITS (cartes flottantes) ============ */}
      <section className="mx-auto -mt-10 max-w-app px-4">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="display text-2xl">Nouveautés</h2>
          <Link href="/shop" className="text-sm font-semibold text-accent-ink hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rest.map((p) => (
            <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[300px]">
              <ProductCard product={p} floating />
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATÉGORIES ============ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-app px-4 pt-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?cat=${c.slug}`}
                className="rounded-pill border border-paper-line bg-paper-soft px-5 py-2.5 text-sm font-medium hover:border-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ AVANTAGES ============ */}
      <section className="mx-auto mt-14 max-w-app px-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Mobile Money", "Wave, Orange, MTN, Moov. Validé sur ton téléphone."],
            ["Sans compte", "Commande en quelques champs, suis par lien."],
            ["Stock réel", "Ce qui s'affiche est ce qui part."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-card border border-paper-line bg-paper p-6 shadow-card">
              <div className="display text-lg">{t}</div>
              <p className="mt-1.5 text-sm text-ink-faint">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
