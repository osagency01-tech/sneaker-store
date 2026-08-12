/* ==================================================================== *
 *  Rate-limiting simple en mémoire (fenêtre glissante par IP + clé).
 *
 *  Suffisant pour un MVP sur une instance. En multi-instance (scaling
 *  horizontal Vercel), remplacer par un store partagé (Upstash Redis).
 *  On échoue "ouvert" (on autorise) en cas de doute, pour ne jamais
 *  bloquer un vrai client à cause du limiteur.
 * ==================================================================== */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

// Nettoyage passif pour éviter la croissance mémoire
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, b] of store) if (b.resetAt < now) store.delete(k);
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const b = store.get(key);

  if (!b || b.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  if (b.count >= opts.limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }

  b.count++;
  return { ok: true, remaining: opts.limit - b.count, retryAfter: 0 };
}

/* Extrait une IP client exploitable derrière le proxy Vercel. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
