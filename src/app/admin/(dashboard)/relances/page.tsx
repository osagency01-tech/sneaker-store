import { getAbandonedOrders } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";
import { COUNTRIES } from "@/lib/payment/countries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Relances" };

function waLink(phone: string, country: string, orderNum: string) {
  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "";
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const full = digits.startsWith(dial) ? digits : dial + digits;
  const msg = encodeURIComponent(
    `Bonjour ! Vous avez commencé une commande sur Vantom (${orderNum}) mais le paiement n'a pas abouti. Souhaitez-vous qu'on vous aide à la finaliser ?`
  );
  return `https://wa.me/${full}?text=${msg}`;
}

export default async function RelancesPage() {
  const orders = await getAbandonedOrders();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl">Relances</h1>
        <span className="tech text-sm text-ink-faint">{orders.length}</span>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        Commandes non payées de plus de 10 min. Contactez le client sur WhatsApp
        pour l'aider à finaliser.
      </p>

      <div className="mt-5 space-y-3">
        {orders.map((o: any) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-card border border-paper-line bg-paper p-4">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{o.customer?.full_name ?? "—"}</div>
              <div className="tech text-xs text-ink-faint">
                {o.order_number} · {formatXOF(o.total)} ·{" "}
                {new Date(o.created_at).toLocaleString("fr-FR")}
              </div>
              <div className="tech mt-0.5 text-sm">{o.customer?.phone}</div>
            </div>
            {o.customer?.phone && (
              <a
                href={waLink(o.customer.phone, o.customer.country, o.order_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill bg-ok px-5 py-2.5 text-sm font-semibold text-paper"
              >
                Relancer sur WhatsApp
              </a>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-faint">
            Aucun panier abandonné pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
