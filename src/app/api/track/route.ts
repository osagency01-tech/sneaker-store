import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const trackSchema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  eventType: z.enum(["PAGE_VIEW", "PRODUCT_VIEW", "ADD_TO_CART", "BEGIN_CHECKOUT", "PURCHASE"]),
  productId: z.string().uuid().nullable().optional(),
  path: z.string().trim().max(300).optional(),
});

/* Best-effort : un tunnel de conversion ne doit jamais bloquer ni ralentir
   l'expérience d'achat. Toute erreur (table absente, réseau, etc.) renvoie
   simplement 204 sans détail. */
export async function POST(req: Request) {
  const rl = rateLimit(`track:` + clientIp(req), { limit: 60, windowMs: 60000 });
  if (!rl.ok) return new NextResponse(null, { status: 204 });

  try {
    const body = await req.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const { sessionId, eventType, productId, path } = parsed.data;
    const db = createAdminClient();
    await db.from("analytics_events").insert({
      session_id: sessionId,
      event_type: eventType,
      product_id: productId ?? null,
      path: path ?? null,
    });
  } catch {
    /* silencieux — le tracking ne doit jamais casser le parcours client */
  }

  return new NextResponse(null, { status: 204 });
}
