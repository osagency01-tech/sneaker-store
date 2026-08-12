import { redirect } from "next/navigation";
import { getPartner } from "@/lib/auth";
import { getPartnerStats } from "@/lib/partner-data";
import { formatXOF } from "@/lib/format";
import { SignOutButton } from "@/components/SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espace partenaire" };

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default async function PartnerPage() {
  const partner = await getPartner();
  if (!partner) redirect("/partenaire/login");

  const { today, history } = await getPartnerStats();
  const rest = history.filter((d) => d.date !== today.date);

  return (
    <div className="min-h-screen bg-paper-soft">
      <header className="border-b border-paper-line bg-paper">
        <div className="mx-auto flex max-w-app items-center gap-4 px-4 h-14">
          <div className="display text-lg">
            VANTOM<span className="text-ink-faint"> · partenaire</span>
          </div>
          <SignOutButton redirectTo="/partenaire/login" className="ml-auto text-sm text-ink-faint hover:text-ink" />
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        <h1 className="display text-2xl">Bonjour {partner.profile.full_name ?? ""}</h1>
        <p className="mt-1 text-sm text-ink-faint">Votre part (50%) sur les ventes payées.</p>

        <div className="mt-5 rounded-card border border-paper-line bg-paper p-6 shadow-card">
          <div className="eyebrow">Aujourd&apos;hui</div>
          <div className="tech mt-1 text-4xl font-bold text-ink">{formatXOF(today.partnerAmount)}</div>
          <div className="mt-1 text-sm text-ink-faint">
            {today.pairs} paire{today.pairs > 1 ? "s" : ""} vendue{today.pairs > 1 ? "s" : ""} aujourd&apos;hui
          </div>
        </div>

        <div className="mt-6 rounded-card border border-paper-line bg-paper p-5">
          <h2 className="display text-lg">Historique</h2>
          <div className="mt-3 divide-y divide-paper-line">
            {rest.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">Rien d&apos;autre pour le moment.</p>
            )}
            {rest.map((d) => (
              <div key={d.date} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink-soft">{formatDate(d.date)}</span>
                <span className="text-right">
                  <span className="tech font-bold text-ink">{formatXOF(d.partnerAmount)}</span>
                  <span className="ml-2 text-xs text-ink-faint">
                    ({d.pairs} paire{d.pairs > 1 ? "s" : ""})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
