"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";
import { computeShipping } from "@/lib/orders/shipping";
import { COUNTRIES } from "@/lib/payment/countries";

export function CheckoutForm() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    country: "CI",
    city: "",
    address: "",
  });

  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center text-ink-faint">
        Votre panier est vide.{" "}
        <a href="/shop" className="text-accent-ink underline">Retour boutique</a>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email || undefined,
            country: form.country,
            city: form.city,
            address: form.address,
          },
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      // Commande créée. On garde le panier jusqu'au paiement confirmé,
      // mais on passe la main à l'écran de paiement via l'external_reference.
      const params = new URLSearchParams({
        ref: data.externalReference,
        country: form.country,
        phone: form.phone,
        token: data.accessToken,
        order: data.orderNumber,
      });
      clear();
      router.push(`/payment/${data.orderId}?${params.toString()}`);
    } catch {
      setError("Connexion impossible. Réessayez.");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-base focus:border-ink";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div>
          <label className="eyebrow mb-1.5 block">Nom complet</label>
          <input required value={form.fullName} onChange={set("fullName")} className={field}
            placeholder="Awa Traoré" autoComplete="name" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-1.5 block">Pays</label>
            <select value={form.country} onChange={set("country")} className={field}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name} (+{c.dial})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow mb-1.5 block">Téléphone Mobile Money</label>
            <input required value={form.phone} onChange={set("phone")} className={field}
              placeholder="07 00 00 00 00" inputMode="tel" autoComplete="tel" />
          </div>
        </div>

        <div>
          <label className="eyebrow mb-1.5 block">Email (optionnel)</label>
          <input type="email" value={form.email} onChange={set("email")} className={field}
            placeholder="awa@email.com" autoComplete="email" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-1.5 block">Ville</label>
            <input required value={form.city} onChange={set("city")} className={field}
              placeholder="Abidjan" autoComplete="address-level2" />
          </div>
          <div>
            <label className="eyebrow mb-1.5 block">Quartier / adresse</label>
            <input required value={form.address} onChange={set("address")} className={field}
              placeholder="Cocody, rue des Jardins" autoComplete="street-address" />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
        )}
      </div>

      {/* Récap + soumission */}
      <div className="lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-card border border-paper-line bg-paper-soft p-5">
          <div className="eyebrow mb-3">Votre commande</div>
          <ul className="space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.variantId} className="flex justify-between gap-2">
                <span className="text-ink-soft">
                  {l.name} <span className="tech text-xs">·{l.size}·×{l.quantity}</span>
                </span>
                <span className="tech">{formatXOF(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-paper-line pt-3 text-sm">
            <div className="flex justify-between py-0.5">
              <span className="text-ink-soft">Sous-total</span>
              <span className="tech">{formatXOF(subtotal)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-ink-soft">Livraison</span>
              <span className="tech">{shipping === 0 ? "Offerte" : formatXOF(shipping)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-paper-line pt-2">
              <span className="font-semibold">Total</span>
              <span className="tech text-lg">{formatXOF(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {loading ? "Création de la commande…" : "Continuer vers le paiement"}
          </button>
          <p className="mt-2 text-center text-xs text-ink-faint">
            Le montant est recalculé et vérifié côté serveur.
          </p>
        </div>
      </div>
    </form>
  );
}
