import Link from "next/link";
import { getProducts, getCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 60;

export const metadata = { title: "Boutique" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { cat?: string; q?: string; sort?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: searchParams.cat, query: searchParams.q }),
    getCategories(),
  ]);

  const sorted = [...products];
  if (searchParams.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (searchParams.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);

  const mk = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const cat = patch.cat ?? searchParams.cat;
    const q = patch.q ?? searchParams.q;
    const sort = patch.sort ?? searchParams.sort;
    if (cat) p.set("cat", cat);
    if (q) p.set("q", q);
    if (sort) p.set("sort", sort);
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-app px-4 py-6">
      <div className="flex items-end justify-between">
        <h1 className="display text-3xl">Boutique</h1>
        <span className="tech text-sm text-ink-faint">{sorted.length} modèles</span>
      </div>

      {/* Filtres catégorie — scroll horizontal sur mobile */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
        <Link
          href={mk({ cat: undefined })}
          className={`rounded-pill border px-4 py-1.5 text-sm ${
            !searchParams.cat ? "border-ink bg-ink text-paper" : "border-paper-line bg-paper-soft"
          }`}
        >
          Tout
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={mk({ cat: c.slug })}
            className={`rounded-pill border px-4 py-1.5 text-sm ${
              searchParams.cat === c.slug
                ? "border-ink bg-ink text-paper"
                : "border-paper-line bg-paper-soft"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Tri */}
      <div className="mt-3 flex gap-2 text-sm">
        <span className="text-ink-faint">Trier :</span>
        <Link href={mk({ sort: undefined })} className="hover:underline">Nouveautés</Link>
        <Link href={mk({ sort: "price-asc" })} className="hover:underline">Prix ↑</Link>
        <Link href={mk({ sort: "price-desc" })} className="hover:underline">Prix ↓</Link>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-16 text-center text-ink-faint">
          Aucun modèle ne correspond. Essayez une autre catégorie.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
