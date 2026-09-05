import Link from "next/link";
import { getDashboardStats, getRecentOrders, getFunnelStats, getRecentSessions } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const [stats, recent, funnel, sessions] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getFunnelStats(),
    getRecentSessions(),
  ]);

  const cards = [
    ["Chiffre d'affaires", formatXOF(stats.revenue)],
    ["Commandes payées", String(stats.paidCount)],
    ["Commandes totales", String(stats.totalOrders)],
    ["Produits", String(stats.products)],
  ];

  return (
    <div>
      <h1 className="display text-2xl">Tableau de bord</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-card border border-paper-line bg-paper p-4">
            <div className="eyebrow">{label}</div>
            <div className="tech mt-1 text-xl">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Commandes récentes */}
        <div className="rounded-card border border-paper-line bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-lg">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-sm text-accent-ink hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-paper-line">
            {recent.map((o: any) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:opacity-70"
              >
                <div>
                  <div className="tech">{o.order_number}</div>
                  <div className="text-xs text-ink-faint">{o.customer?.full_name ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="tech">{formatXOF(o.total)}</div>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
            {recent.length === 0 && <p className="py-6 text-center text-sm text-ink-faint">Aucune commande.</p>}
          </div>
        </div>

        {/* Stock faible */}
        <div className="rounded-card border border-paper-line bg-paper p-5">
          <h2 className="display text-lg">Stock faible</h2>
          <div className="mt-3 space-y-2">
            {stats.lowStock.length === 0 && (
              <p className="text-sm text-ink-faint">Tout est bien approvisionné.</p>
            )}
            {stats.lowStock.map((v: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {v.products?.name} · {v.size}
                </span>
                <span className={`tech ${v.stock === 0 ? "text-danger" : "text-warn"}`}>
                  {v.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tunnel de conversion */}
      <div className="mt-6 rounded-card border border-paper-line bg-paper p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="display text-lg">Tunnel de conversion</h2>
          <span className="text-xs text-ink-faint">30 derniers jours</span>
        </div>
        {!funnel.available ? (
          <p className="mt-3 text-sm text-ink-faint">
            Le suivi du tunnel n'est pas encore activé — exécutez la migration
            <code className="mx-1 rounded bg-paper-soft px-1.5 py-0.5 text-xs">0010_analytics_events.sql</code>
            dans Supabase pour l'activer.
          </p>
        ) : (
          <FunnelBars funnel={funnel} />
        )}
      </div>

      {/* Sessions récentes — où les visiteurs décrochent */}
      {sessions.available && sessions.sessions.length > 0 && (
        <div className="mt-6 rounded-card border border-paper-line bg-paper p-5">
          <h2 className="display text-lg">Sessions récentes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint">
                  <th className="pb-2 font-medium">Session</th>
                  <th className="pb-2 font-medium">Produit</th>
                  <th className="pb-2 font-medium">Dernière étape</th>
                  <th className="pb-2 text-right font-medium">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-line">
                {sessions.sessions.map((s) => (
                  <tr key={s.sessionId}>
                    <td className="tech py-2 text-xs text-ink-faint">#{s.sessionId.slice(0, 6)}</td>
                    <td className="py-2 text-ink-soft">{s.productName ?? "—"}</td>
                    <td className="py-2">
                      <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-xs text-accent-ink">
                        {s.stepLabel}
                      </span>
                    </td>
                    <td className="tech py-2 text-right text-xs text-ink-faint">
                      {new Date(s.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FunnelBars({
  funnel,
}: {
  funnel: { pageViews: number; productViews: number; addToCart: number; beginCheckout: number; purchases: number };
}) {
  const steps = [
    { label: "Visiteurs", value: funnel.pageViews },
    { label: "Produits consultés", value: funnel.productViews },
    { label: "Ajouts panier", value: funnel.addToCart },
    { label: "Début paiement", value: funnel.beginCheckout },
    { label: "Achats", value: funnel.purchases },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));
  const conversionRate = funnel.pageViews > 0 ? Math.round((funnel.purchases / funnel.pageViews) * 100) : 0;

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const dropPct = prev && prev > 0 ? Math.round((1 - s.value / prev) * 100) : null;
          return (
            <div key={s.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-ink-soft">{s.label}</span>
                <span className="flex items-baseline gap-2">
                  {dropPct !== null && dropPct > 0 && (
                    <span className="text-xs text-danger">-{dropPct}%</span>
                  )}
                  <span className="tech font-semibold text-ink">{s.value}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-pill bg-paper-soft">
                <div
                  className="h-full rounded-pill bg-accent"
                  style={{ width: `${Math.max(3, (s.value / max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border-t border-paper-line pt-3 text-sm">
        <span className="text-ink-soft">Taux de conversion global</span>{" "}
        <span className="tech font-semibold text-ink">{conversionRate}%</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "bg-warn/15 text-warn",
    PAID: "bg-ok/15 text-ok",
    PROCESSING: "bg-accent-soft text-accent-ink",
    SHIPPED: "bg-accent-soft text-accent-ink",
    DELIVERED: "bg-ok/15 text-ok",
    CANCELLED: "bg-danger/15 text-danger",
  };
  return (
    <span className={`inline-block rounded-pill px-2 py-0.5 text-[10px] ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}
