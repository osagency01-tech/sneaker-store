import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";
export const metadata = { title: "Détail commande" };

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await getOrderDetail(params.id);
  if (!order) notFound();
  const o: any = order;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl">{o.order_number}</h1>
        <span className="tech text-sm text-ink-faint">
          {new Date(o.created_at).toLocaleDateString("fr-FR")}
        </span>
      </div>

      <div className="mt-5 rounded-card border border-paper-line bg-paper p-5">
        <div className="eyebrow mb-2">Statut</div>
        <OrderStatusControl orderId={o.id} current={o.status} />
      </div>

      <div className="mt-4 rounded-card border border-paper-line bg-paper p-5">
        <div className="eyebrow mb-3">Articles</div>
        <ul className="divide-y divide-paper-line">
          {o.items.map((it: any) => (
            <li key={it.id} className="flex justify-between py-2 text-sm">
              <span className="text-ink-soft">
                {it.product_name} <span className="tech text-xs">·{it.size}·×{it.quantity}</span>
              </span>
              <span className="tech">{formatXOF(it.unit_price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-paper-line pt-3 font-semibold">
          <span>Total</span>
          <span className="tech">{formatXOF(o.total)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-paper-line bg-paper p-5 text-sm">
          <div className="eyebrow mb-2">Client</div>
          {o.customer && (
            <p className="text-ink-soft">
              {o.customer.full_name}<br />
              {o.customer.phone}<br />
              {o.customer.email || "—"}<br />
              {[o.customer.address, o.customer.city].filter(Boolean).join(", ")} {o.customer.city ? "" : ""}({o.customer.country})
            </p>
          )}
        </div>
        <div className="rounded-card border border-paper-line bg-paper p-5 text-sm">
          <div className="eyebrow mb-2">Paiement</div>
          {o.payment ? (
            <p className="text-ink-soft">
              {o.payment.provider} · {o.payment.operator || "—"}<br />
              Statut : <span className="tech">{o.payment.status}</span><br />
              Réf : <span className="tech text-xs">{o.payment.external_reference}</span>
            </p>
          ) : (
            <p className="text-ink-faint">Aucun paiement.</p>
          )}
        </div>
      </div>
    </div>
  );
}
