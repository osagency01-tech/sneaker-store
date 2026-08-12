"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@/types/db";

const FLOW: OrderStatus[] = [
  "PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
];

export function OrderStatusControl({
  orderId, current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
      >
        {FLOW.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={() =>
          start(async () => {
            const res = await updateOrderStatus(orderId, status);
            setMsg(res.ok ? "Mis à jour ✓" : res.error ?? "Erreur");
            setTimeout(() => setMsg(null), 1500);
          })
        }
        disabled={pending || status === current}
        className="rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40"
      >
        {pending ? "…" : "Enregistrer"}
      </button>
      {msg && <span className="text-sm text-ok">{msg}</span>}
    </div>
  );
}
