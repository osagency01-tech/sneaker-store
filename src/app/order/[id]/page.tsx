import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatXOF } from "@/lib/format";
import type { OrderStatus } from "@/types/db";

export const metadata = { title: "Ma commande" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STEPS: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string; paid?: string };
}) {
  const token = searchParams.token;
  if (!token) notFound();

  // Accès sécurisé par access_token — pas de compte requis
  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("*, items:order_items(*), customer:customers(*), payment:payments(*)")
    .eq("id", params.id)
    .eq("access_token", token)
    .single();

  if (!order) notFound();

  const o: any = order;
  const status = o.status as OrderStatus;
  const isPaid = status !== "PENDING_PAYMENT" && status !== "CANCELLED";
  const currentStep = STEPS.indexOf(status);

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Bandeau statut */}
        <div className="rounded-card border border-paper-line bg-paper p-6 text-center shadow-card">
          {searchParams.paid === "1" && status === "PAID" ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/15 text-2xl text-ok">
                ✓
              </div>
              <h1 className="display mt-4 text-2xl">Merci ! Commande confirmée</h1>
            </>
          ) : (
            <h1 className="display text-2xl">Commande {o.order_number}</h1>
          )}
          <p className="mt-1 text-sm text-ink-faint">
            Statut : <span className="font-medium text-ink">{STATUS_LABEL[status]}</span>
          </p>

          {status === "PENDING_PAYMENT" && (
            <p className="mx-auto mt-3 max-w-sm rounded-xl bg-warn/10 px-4 py-2 text-sm text-warn">
              Le paiement n'a pas encore été confirmé pour cette commande.
            </p>
          )}
        </div>

        {/* Progression */}
        {isPaid && (
          <div className="mt-4 rounded-card border border-paper-line bg-paper p-6">
            <div className="flex justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                      i <= currentStep ? "bg-ink text-paper" : "bg-paper-soft text-ink-faint"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-1 text-[11px] text-ink-soft">{STATUS_LABEL[s]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Détail */}
        <div className="mt-4 rounded-card border border-paper-line bg-paper p-6">
          <div className="eyebrow mb-3">Articles</div>
          <ul className="divide-y divide-paper-line">
            {o.items.map((it: any) => (
              <li key={it.id} className="flex justify-between gap-2 py-2 text-sm">
                <span className="text-ink-soft">
                  {it.product_name}{" "}
                  <span className="tech text-xs">·{it.size}·×{it.quantity}</span>
                </span>
                <span className="tech">{formatXOF(it.unit_price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-paper-line pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Sous-total</span>
              <span className="tech">{formatXOF(o.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Livraison</span>
              <span className="tech text-ok">Gratuite</span>
            </div>
            <div className="flex justify-between border-t border-paper-line pt-2 font-semibold">
              <span>Total</span>
              <span className="tech text-lg">{formatXOF(o.total)}</span>
            </div>
          </div>
        </div>

        {/* Livraison */}
        {o.customer && (
          <div className="mt-4 rounded-card border border-paper-line bg-paper p-6 text-sm">
            <div className="eyebrow mb-2">Livraison</div>
            <p className="text-ink-soft">
              {o.customer.full_name}
              <br />
              {[o.customer.address, o.customer.city].filter(Boolean).join(", ") || o.customer.country}
              <br />
              {o.customer.phone}
            </p>
          </div>
        )}

        {status === "PENDING_PAYMENT" && (
          <Link
            href="/shop"
            className="mt-6 block rounded-pill border border-ink py-3 text-center text-sm font-semibold"
          >
            Retour à la boutique
          </Link>
        )}

        <p className="mt-6 text-center text-xs text-ink-faint">
          Conservez ce lien pour suivre votre commande.
        </p>
      </div>
    </div>
  );
}
