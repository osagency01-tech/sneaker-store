import Link from "next/link";
import { getAllOrders } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commandes" };

export default async function AdminOrders() {
  const orders = await getAllOrders();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl">Commandes</h1>
        <span className="tech text-sm text-ink-faint">{orders.length}</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-card border border-paper-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-paper-line text-left text-ink-faint">
            <tr>
              <th className="p-3 font-medium">Commande</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-paper-soft">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="tech hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="p-3 text-ink-soft">{o.customer?.full_name ?? "—"}</td>
                <td className="p-3 tech">{formatXOF(o.total)}</td>
                <td className="p-3">
                  <span className="rounded-pill bg-paper-soft px-2 py-0.5 text-[11px]">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-faint">Aucune commande.</p>
        )}
      </div>
    </div>
  );
}
