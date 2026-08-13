import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { payInitSchema } from "@/lib/validation";
import { getProvider } from "@/lib/payment";
import { normalizeMsisdn, findCountry } from "@/lib/payment/countries";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const rl = rateLimit(`pay-init:` + clientIp(req), { limit: 15, windowMs: 60000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans un instant." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = payInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 422 }
    );
  }

  const { externalReference, operator, phone, countryCode } = parsed.data;
  const country = findCountry(countryCode);
  if (!country || !country.operators.includes(operator)) {
    return NextResponse.json(
      { error: "Cet opérateur n'est pas disponible dans ce pays." },
      { status: 422 }
    );
  }

  // Relire le paiement + montant réel en base (jamais depuis le client)
  const db = createAdminClient();
  const { data: payment, error } = await db
    .from("payments")
    .select("id, amount, status, order_id, orders(order_number)")
    .eq("external_reference", externalReference)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json(
      { error: "Ce paiement a déjà été traité." },
      { status: 409 }
    );
  }

  const provider = getProvider();
  const msisdn = normalizeMsisdn(phone, country.dial);
  const orderNum = (payment as any).orders?.order_number ?? externalReference;

  const result = await provider.createCheckout({
    amount: payment.amount,
    phone: msisdn,
    operator,
    countryCode,
    externalReference,
    description: `Commande ${orderNum}`,
  });

  if (result.kind === "error") {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  await db
    .from("payments")
    .update({ operator, provider_tx_id: result.providerTxId })
    .eq("id", payment.id);

  if (result.kind === "redirect") {
    return NextResponse.json({
      kind: "redirect",
      url: result.url,
      message: result.message,
      reference: result.reference,
    });
  }

  return NextResponse.json({
    kind: "ussd_push",
    message: result.message,
    reference: result.reference,
  });
}
