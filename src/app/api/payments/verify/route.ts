import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifySchema } from "@/lib/validation";
import { verifyPayment } from "@/lib/orders/verify-payment";

export async function POST(req: Request) {
  const rl = rateLimit(`pay-verify:` + clientIp(req), { limit: 90, windowMs: 60000 });
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

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Référence manquante." }, { status: 422 });
  }

  const result = await verifyPayment(parsed.data.externalReference);
  return NextResponse.json(result);
}
