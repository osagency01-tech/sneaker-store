/* ==================================================================== *
 *  CRON — Réconciliation des paiements.
 *
 *  Problème résolu : la vérification "live" dépend du navigateur (polling).
 *  Si le client ferme l'onglet pendant qu'il valide sur son téléphone, un
 *  paiement réussi n'est jamais constaté côté serveur → commande bloquée
 *  en PENDING_PAYMENT alors que le client a payé.
 *
 *  Ce cron reprend périodiquement tous les paiements PENDING récents et
 *  les revérifie auprès de l'agrégateur, en réutilisant exactement la même
 *  logique idempotente que le polling (verifyPayment → confirm_order_paid).
 *
 *  Sécurité : protégé par un secret (CRON_SECRET) via l'en-tête
 *  Authorization: Bearer <secret> — c'est ce que Vercel Cron envoie.
 * ==================================================================== */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/orders/verify-payment";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fenêtre : on ne reprend que les paiements des dernières 24 h, et on
// laisse un petit délai (2 min) pour ne pas doubler le polling live.
const LOOKBACK_HOURS = 24;
const MIN_AGE_MINUTES = 2;

export async function GET(req: Request) {
  // --- Authentification du cron ---
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const db = createAdminClient();
  const now = Date.now();
  const since = new Date(now - LOOKBACK_HOURS * 3600_000).toISOString();
  const until = new Date(now - MIN_AGE_MINUTES * 60_000).toISOString();

  // Paiements encore en attente dans la fenêtre
  const { data: pendings, error } = await db
    .from("payments")
    .select("external_reference, created_at")
    .eq("status", "PENDING")
    .gte("created_at", since)
    .lte("created_at", until)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let paid = 0, rejected = 0, stillPending = 0, errors = 0;

  for (const p of pendings ?? []) {
    try {
      const res = await verifyPayment(p.external_reference);
      if (res.state === "paid") paid++;
      else if (res.state === "rejected") rejected++;
      else if (res.state === "pending") stillPending++;
      else errors++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    checked: pendings?.length ?? 0,
    paid,
    rejected,
    stillPending,
    errors,
    at: new Date().toISOString(),
  });
}
