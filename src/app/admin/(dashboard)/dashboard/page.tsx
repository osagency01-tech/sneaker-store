import Link from "next/link";
import { getDashboardStats, getRecentOrders } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentOrders()]);

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
