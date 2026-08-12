import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";
import { createOrder } from "@/lib/orders/create-order";

export async function POST(req: Request) {
  const rl = rateLimit(`checkout:` + clientIp(req), { limit: 10, windowMs: 60000 });
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

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Données invalides.";
    return NextResponse.json({ error: first }, { status: 422 });
  }

  const { customer, lines } = parsed.data;
  const result = await createOrder(lines, {
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email || null,
    country: customer.country,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    accessToken: result.accessToken,
    externalReference: result.externalReference,
    total: result.total,
  });
}
