import { getReviewsForProduct, getReviewSummary } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="tech text-sm text-warn" aria-hidden>
      {"★".repeat(rating)}
      <span className="text-paper-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function relativeDate(daysAgo: number): string {
  if (daysAgo <= 0) return "Aujourd'hui";
  if (daysAgo === 1) return "Hier";
  if (daysAgo < 30) return `Il y a ${daysAgo} jours`;
  const months = Math.round(daysAgo / 30);
  return months <= 1 ? "Il y a 1 mois" : `Il y a ${months} mois`;
}

export function ProductReviews({ productId }: { productId: string }) {
  const reviews = getReviewsForProduct(productId);
  const { average, count } = getReviewSummary(reviews);

  return (
    <section className="mt-10 border-t border-paper-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-xl sm:text-2xl">Avis clients</h2>
        <div className="flex items-center gap-2">
          <Stars rating={Math.round(average)} />
          <span className="tech text-sm font-semibold text-ink">{average.toFixed(1)}/5</span>
          <span className="text-xs text-ink-faint">Basé sur {count} avis</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-card border border-paper-line bg-paper p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{r.author}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.comment}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-faint">
              {r.verified && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-ok/10 px-2 py-0.5 font-medium text-ok">
                  ✓ Achat vérifié
                </span>
              )}
              <span>{relativeDate(r.daysAgo)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
