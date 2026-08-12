/* Lectures partenaire — service_role (contourne RLS). Réservé à la page
   /partenaire déjà protégée par getPartner().

   Règle de calcul (validée avec le client) : le partenaire est à 50%,
   mais on ne montre jamais de chiffre à virgule. On compte le nombre de
   PAIRES vendues sur la période, on le divise par 2 en arrondissant en
   dessous (une paire seule ne rapporte rien tant qu'elle n'est pas
   "complétée" par une seconde), puis on valorise ce nombre de paires au
   prix moyen du jour. Ex: 1 paire vendue -> 0 FCFA. 2 paires vendues à
   16 000 FCFA -> 16 000 FCFA (soit la valeur d'1 paire). */
import { createAdminClient } from "@/lib/supabase/admin";

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export type PartnerDay = {
  date: string; // YYYY-MM-DD
  pairs: number;
  partnerPairs: number;
  partnerAmount: number;
};

function computeDay(pairs: number, revenue: number): { partnerPairs: number; partnerAmount: number } {
  const partnerPairs = Math.floor(pairs / 2);
  const partnerAmount = pairs > 0 ? Math.floor((partnerPairs * revenue) / pairs) : 0;
  return { partnerPairs, partnerAmount };
}

export async function getPartnerStats() {
  const db = createAdminClient();
  const { data } = await db
    .from("order_items")
    .select("quantity, unit_price, orders!inner(status, created_at)")
    .in("orders.status", PAID_STATUSES);

  const byDay = new Map<string, { pairs: number; revenue: number }>();
  for (const row of (data ?? []) as any[]) {
    const date = String(row.orders.created_at).slice(0, 10);
    const entry = byDay.get(date) ?? { pairs: 0, revenue: 0 };
    entry.pairs += row.quantity;
    entry.revenue += row.quantity * row.unit_price;
    byDay.set(date, entry);
  }

  const history: PartnerDay[] = Array.from(byDay.entries())
    .map(([date, { pairs, revenue }]) => ({ date, pairs, ...computeDay(pairs, revenue) }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayKey = new Date().toISOString().slice(0, 10);
  const today: PartnerDay =
    history.find((d) => d.date === todayKey) ?? {
      date: todayKey,
      pairs: 0,
      partnerPairs: 0,
      partnerAmount: 0,
    };

  return { today, history };
}
