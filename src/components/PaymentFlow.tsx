"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { operatorsFor, OPERATOR_LABEL, type Operator } from "@/lib/payment/countries";

type Phase = "choose" | "pushing" | "waiting" | "paid" | "rejected";

const POLL_MS = 5000;
const MAX_POLLS = 60; // ~5 min

export function PaymentFlow({
  orderId,
  externalReference,
  countryCode,
  phone,
  accessToken,
  orderNumber,
  initialPhase = "choose",
  initialError = null,
}: {
  orderId: string;
  externalReference: string;
  countryCode: string;
  phone: string;
  accessToken: string;
  orderNumber: string;
  initialPhase?: Phase;
  initialError?: string | null;
}) {
  const router = useRouter();
  const ops = operatorsFor(countryCode);
  const [operator, setOperator] = useState<Operator | null>(ops[0] ?? null);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const verify = useCallback(async () => {
    countRef.current += 1;
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalReference }),
      });
      const data = await res.json();
      if (data.state === "paid") {
        stopPolling();
        setPhase("paid");
        setTimeout(() => {
          router.push(`/order/${orderId}?token=${accessToken}&paid=1`);
        }, 1200);
      } else if (data.state === "rejected") {
        stopPolling();
        setPhase("rejected");
        setError("Le paiement a été refusé ou annulé.");
      } else if (countRef.current >= MAX_POLLS) {
        stopPolling();
        setPhase("rejected");
        setError("Délai dépassé. Si vous avez été débité, contactez-nous avec votre numéro de commande.");
      }
    } catch {
      // on laisse le polling continuer malgré une erreur réseau ponctuelle
    }
  }, [externalReference, orderId, accessToken, router, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Page reprenable : si on arrive déjà en phase "waiting" (une demande a
  // été envoyée avant un rechargement/fermeture d'onglet), on relance le
  // polling automatiquement au lieu de renvoyer une nouvelle demande.
  useEffect(() => {
    if (initialPhase !== "waiting") return;
    countRef.current = 0;
    verify();
    pollRef.current = setInterval(verify, POLL_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function launch() {
    if (!operator) return;
    setError(null);
    setPhase("pushing");
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalReference,
          operator,
          phone: phoneNumber,
          countryCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Le paiement n'a pas pu être lancé.");
        setPhase("choose");
        return;
      }
      setMessage(data.message);
      setPhase("waiting");
      countRef.current = 0;
      // premier check rapide puis toutes les 5s
      verify();
      pollRef.current = setInterval(verify, POLL_MS);
    } catch {
      setError("Connexion impossible. Réessayez.");
      setPhase("choose");
    }
  }

  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-sm focus:border-ink";

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-card border border-paper-line bg-paper p-6 shadow-card">
        <div className="eyebrow">Commande {orderNumber}</div>

        {phase === "choose" && (
          <>
            <h1 className="display mt-1 text-2xl">Payer au Mobile Money</h1>
            <p className="mt-1 text-sm text-ink-faint">
              Choisissez votre opérateur. Un message de validation sera envoyé sur votre téléphone.
            </p>

            <div className="mt-5">
              <label className="eyebrow mb-2 block">Opérateur</label>
              <div className="grid grid-cols-2 gap-2">
                {ops.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`rounded-xl border py-3 text-sm font-medium ${
                      operator === op ? "border-ink bg-ink text-paper" : "border-paper-line"
                    }`}
                  >
                    {OPERATOR_LABEL[op]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="eyebrow mb-1.5 block">Numéro Mobile Money</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={field}
                inputMode="tel"
                placeholder="07 00 00 00 00"
              />
            </div>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <button
              onClick={launch}
              disabled={!operator || phoneNumber.length < 6}
              className="mt-5 w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-40"
            >
              Envoyer la demande de paiement
            </button>
          </>
        )}

        {phase === "pushing" && (
          <div className="py-8 text-center">
            <Spinner />
            <p className="mt-4 text-sm text-ink-soft">Envoi de la demande…</p>
          </div>
        )}

        {phase === "waiting" && (
          <div className="py-6 text-center">
            <Spinner />
            <h2 className="display mt-4 text-xl">Validez sur votre téléphone</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
              {message ??
                "Composez votre code Mobile Money sur l'écran qui s'affiche sur votre téléphone."}
            </p>
            <p className="tech mt-4 text-xs text-ink-faint">
              Vérification automatique du paiement en cours…
            </p>
          </div>
        )}

        {phase === "paid" && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/15 text-2xl text-ok">
              ✓
            </div>
            <h2 className="display mt-4 text-xl">Paiement confirmé</h2>
            <p className="mt-1 text-sm text-ink-soft">Redirection vers votre commande…</p>
          </div>
        )}

        {phase === "rejected" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-2xl text-danger">
              ✕
            </div>
            <h2 className="display mt-4 text-xl">Paiement non abouti</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">{error}</p>
            <button
              onClick={() => {
                setPhase("choose");
                setError(null);
              }}
              className="mt-5 rounded-pill border border-ink px-6 py-3 text-sm font-semibold"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Ne fermez pas cette page pendant la validation. Le statut est vérifié côté serveur.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-paper-line border-t-ink"
      role="status"
      aria-label="Chargement"
    />
  );
}
