import Link from "next/link";
import Image from "next/image";
import type { ProductWithRelations } from "@/types/db";
import { formatXOF } from "@/lib/format";

export function ProductCard({
  product,
  floating = false,
}: {
  product: ProductWithRelations;
  floating?: boolean;
}) {
  const img = product.images?.[0]?.url;
  const inStock = (product.variants ?? []).some((v) => v.stock > 0);
  const onPromo = !!product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = onPromo
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={[
        "group block overflow-hidden rounded-card border border-paper-line bg-paper transition-all",
        floating ? "shadow-card hover:-translate-y-1 hover:shadow-pop" : "shadow-card hover:shadow-pop",
      ].join(" ")}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-paper-soft to-white">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            className="object-contain p-4 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">—</div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-pill bg-ink px-2.5 py-1 text-[11px] font-medium text-paper">
            Épuisé
          </span>
        )}
        {onPromo && (
          <span className="absolute right-3 top-3 rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-paper">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="display truncate text-base text-ink">{product.name}</h3>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="tech text-sm font-bold text-ink">{formatXOF(product.price)}</span>
            {onPromo && (
              <span className="tech text-xs text-ink-faint line-through">
                {formatXOF(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-transform group-hover:scale-110"
          aria-hidden
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
