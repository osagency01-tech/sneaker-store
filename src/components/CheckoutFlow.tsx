"use client";

/* ==================================================================== *
 *  Tunnel en 2 étapes, un seul écran :
 *    Étape 1 — Coordonnées : nom, WhatsApp, email (optionnel), pays.
 *              → crée la commande côté serveur (montant recalculé).
 *    Étape 2 — Paiement : opérateur + numéro Mobile Money (pré-rempli
 *              avec le WhatsApp), puis polling de vérification.
 *  Livraison gratuite.
 * ==================================================================== */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";
import {
  operatorsFor, isPlausiblePhone, findCountry, OPERATOR_LABEL, type Operator,
} from "@/lib/payment/countries";
import { CountrySelect } from "@/components/CountrySelect";
import { trackPixelEvent } from "@/lib/meta-pixel";

const POLL_MS = 5000;
const MAX_POLLS = 60;

type Step = 1 | 2;
type PayPhase = "form" | "pushing" | "waiting" | "paid" | "rejected";

export function CheckoutFlow() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  // Étape 1
  const [info, setInfo] = useState({ fullName: "", phone: "", email: "", country: "CI" });
  const [creating, setCreating] = useState(false);
  const [err1, setErr1] = useState<string | null>(null);

  // Résultat commande
  const [order, setOrder] = useState<{
    orderId: string; externalReference: string; accessToken: string; orderNumber: string;
  } | null>(null);

  // Étape 2
  const ops = operatorsFor(info.country);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [payPhone, setPayPhone] = useState("");
  const [phase, setPhase] = useState<PayPhase>("form");
  const [payMsg, setPayMsg] = useState<string | null>(null);
  const [err2, setErr2] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const total = subtotal; // livraison gratuite

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const initiateTracked = useRef(false);
  useEffect(() => {
    if (initiateTracked.current || lines.length === 0) return;
    initiateTracked.current = true;
    trackPixelEvent("InitiateCheckout", {
      value: subtotal,
      currency: "XOF",
      num_items: lines.reduce((n, l) => n + l.quantity, 0),
      content_ids: lines.map((l) => l.productId),
      contents: lines.map((l) => ({ id: l.productId, quantity: l.quantity, item_price: l.price })),
    });
  }, [lines, subtotal]);

  if (lines.length === 0 && phase !== "paid") {
    return (
      <div className="py-20 text-center text-ink-faint">
        Votre panier est vide.{" "}
        <a href="/shop" className="text-accent-ink underline">Retour boutique</a>
      </div>
    );
  }

  const set = (k: keyof typeof info) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setInfo((f) => ({ ...f, [k]: e.target.value }));

  // -------- Étape 1 : créer la commande --------
  async function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    setErr1(null);
    if (!isPlausiblePhone(info.phone, info.country)) {
      setErr1("Ce numéro ne semble pas correspondre au pays sélectionné. Vérifiez le nombre de chiffres.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: info.fullName,
            phone: info.phone,
            email: info.email || undefined,
            country: info.country,
          },
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr1(data.error ?? "Une erreur est survenue."); setCreating(false); return; }

      setOrder({
        orderId: data.orderId,
        externalReference: data.externalReference,
        accessToken: data.accessToken,
        orderNumber: data.orderNumber,
      });
      // pré-remplir le numéro Mobile Money avec le WhatsApp
      setPayPhone(info.phone);
      setOperator(operatorsFor(info.country)[0] ?? null);
      setStep(2);
    } catch {
      setErr1("Connexion impossible. Réessayez.");
    } finally {
      setCreating(false);
    }
  }

  // -------- Étape 2 : lancer le paiement --------
  const verify = useCallback(async () => {
    if (!order) return;
    countRef.current += 1;
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalReference: order.externalReference }),
      });
      const data = await res.json();
      if (data.state === "paid") {
        stopPolling();
        setPhase("paid");
        clear();
        setTimeout(() => router.push(`/order/${order.orderId}?token=${order.accessToken}&paid=1`), 1200);
      } else if (data.state === "rejected") {
        stopPolling(); setPhase("rejected");
        setErr2("Le paiement a été refusé ou annulé.");
      } else if (countRef.current >= MAX_POLLS) {
        stopPolling(); setPhase("rejected");
        setErr2("Délai dépassé. Si vous avez été débité, contactez-nous avec votre numéro de commande.");
      }
    } catch { /* on continue malgré une coupure ponctuelle */ }
  }, [order, router, clear, stopPolling]);

  async function pay() {
    if (!operator || !order) return;
    setErr2(null);
    setPhase("pushing");
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalReference: order.externalReference,
          operator, phone: payPhone, countryCode: info.country,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr2(data.error ?? "Le paiement n'a pas pu être lancé."); setPhase("form"); return; }

      // Wave : pas de push USSD, on envoie le client valider sur la page Wave.
      if (data.kind === "redirect" && data.url) {
        window.location.href = data.url;
        return;
      }

      setPayMsg(data.message);
      setPhase("waiting");
      countRef.current = 0;
      verify();
      pollRef.current = setInterval(verify, POLL_MS);
    } catch {
      setErr2("Connexion impossible. Réessayez.");
      setPhase("form");
    }
  }

  // text-base (16px) et non text-sm : en dessous de 16px, iOS Safari zoome
  // automatiquement sur le champ au focus et ne dézoome pas correctement.
  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-base focus:border-ink";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* -------- Colonne principale -------- */}
      <div>
        {/* Indicateur d'étapes */}
        <div className="mb-6 flex items-center gap-3 text-sm">
          <StepDot n={1} active={step === 1} done={step > 1} label="Coordonnées" />
          <div className="h-px flex-1 bg-paper-line" />
          <StepDot n={2} active={step === 2} done={phase === "paid"} label="Paiement" />
        </div>

        {step === 1 && (
          <form onSubmit={submitInfo} className="space-y-4 animate-fadeUp">
            <div>
              <label className="eyebrow mb-1.5 block">Nom complet</label>
              <input required value={info.fullName} onChange={set("fullName")} className={field}
                placeholder="Awa Traoré" autoComplete="name" />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Pays de livraison</label>
              <CountrySelect value={info.country} onChange={(code) => setInfo((f) => ({ ...f, country: code }))} />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Numéro WhatsApp (pour le livreur)</label>
              <input required value={info.phone} onChange={set("phone")} className={field}
                placeholder="07 00 00 00 00" inputMode="tel" autoComplete="tel" />
              {info.phone.length > 3 && !isPlausiblePhone(info.phone, info.country) && (
                <p className="mt-1 text-xs text-warn">
                  Ce nombre de chiffres ne correspond pas à un numéro {findCountry(info.country)?.name} habituel.
                </p>
              )}
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Email — suivi du colis (optionnel)</label>
              <input type="email" value={info.email} onChange={set("email")} className={field}
                placeholder="awa@email.com" autoComplete="email" />
            </div>

            {err1 && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err1}</p>}

            <button type="submit" disabled={creating}
              className="w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-50">
              {creating ? "Un instant…" : "Suivant"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="animate-fadeUp">
            {(phase === "form" || phase === "pushing") && (
              <>
                <div className="mb-4">
                  <button onClick={() => setStep(1)} className="text-sm text-ink-faint hover:text-ink">
                    ← Modifier mes coordonnées
                  </button>
                </div>

                <label className="eyebrow mb-2 block">Opérateur Mobile Money</label>
                <div className="grid grid-cols-2 gap-2">
                  {ops.map((op) => (
                    <button key={op} type="button" onClick={() => setOperator(op)}
                      className={`rounded-xl border py-3 text-sm font-medium ${
                        operator === op ? "border-ink bg-ink text-paper" : "border-paper-line"
                      }`}>
                      {OPERATOR_LABEL[op]}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="eyebrow mb-1.5 block">Numéro Mobile Money</label>
                  <input value={payPhone} onChange={(e) => setPayPhone(e.target.value)}
                    className={field} inputMode="tel" placeholder="07 00 00 00 00" />
                  {payPhone.length > 3 && !isPlausiblePhone(payPhone, info.country) ? (
                    <p className="mt-1 text-xs text-warn">
                      Ce nombre de chiffres ne correspond pas à un numéro {findCountry(info.country)?.name} habituel.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-faint">
                      Pré-rempli avec votre WhatsApp. Modifiable si le compte Mobile Money est différent.
                    </p>
                  )}
                </div>

                {err2 && (
                  <p className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err2}</p>
                )}

                <button onClick={pay}
                  disabled={!operator || !isPlausiblePhone(payPhone, info.country) || phase === "pushing"}
                  className="mt-5 w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-40">
                  {phase === "pushing" ? "Envoi…" : `Confirmer le paiement · ${formatXOF(total)}`}
                </button>
              </>
            )}

            {phase === "waiting" && (
              <div className="py-8 text-center">
                <Spinner />
                <h2 className="display mt-4 text-xl">Validez sur votre téléphone</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
                  {payMsg ?? "Composez votre code Mobile Money sur l'écran qui s'affiche."}
                </p>
                <p className="tech mt-4 text-xs text-ink-faint">Vérification automatique en cours…</p>
              </div>
            )}

            {phase === "paid" && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/15 text-2xl text-ok">✓</div>
                <h2 className="display mt-4 text-xl">Paiement confirmé</h2>
                <p className="mt-1 text-sm text-ink-soft">Redirection vers votre commande…</p>
              </div>
            )}

            {phase === "rejected" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-2xl text-danger">✕</div>
                <h2 className="display mt-4 text-xl">Paiement non abouti</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">{err2}</p>
                <button onClick={() => { setPhase("form"); setErr2(null); }}
                  className="mt-5 rounded-pill border border-ink px-6 py-3 text-sm font-semibold">
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------- Récap commande -------- */}
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
              <span className="tech text-ok">Gratuite</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-paper-line pt-2">
              <span className="font-semibold">Total</span>
              <span className="tech text-lg">{formatXOF(total)}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-ink-faint">
          Montant recalculé et vérifié côté serveur.
        </p>
      </div>
    </div>
  );
}

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
        done ? "bg-ok text-paper" : active ? "bg-ink text-paper" : "bg-paper-soft text-ink-faint"
      }`}>
        {done ? "✓" : n}
      </span>
      <span className={`text-sm ${active || done ? "font-semibold text-ink" : "text-ink-faint"}`}>{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-paper-line border-t-ink"
      role="status" aria-label="Chargement" />
  );
}
