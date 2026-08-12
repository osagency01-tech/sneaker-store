import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  ["/admin/dashboard", "Tableau de bord"],
  ["/admin/products", "Produits"],
  ["/admin/orders", "Commandes"],
  ["/admin/relances", "Relances"],
  ["/admin/customers", "Clients"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper-soft">
      <header className="border-b border-paper-line bg-paper">
        <div className="mx-auto flex max-w-app items-center gap-4 px-4 h-14">
          <Link href="/admin/dashboard" className="display text-lg">
            VANTOM<span className="text-ink-faint"> · admin</span>
          </Link>
          <nav className="ml-4 hidden gap-1 sm:flex">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href}
                className="rounded-pill px-3 py-1.5 text-sm text-ink-soft hover:bg-paper-soft">
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="ml-auto text-sm text-ink-faint hover:text-ink">
            Voir le site ↗
          </Link>
          <SignOutButton redirectTo="/admin/login" className="text-sm text-ink-faint hover:text-ink" />
        </div>
        {/* nav mobile */}
        <nav className="flex gap-1 overflow-x-auto px-4 py-2 sm:hidden">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href}
              className="whitespace-nowrap rounded-pill bg-paper-soft px-3 py-1.5 text-sm">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-app px-4 py-6">{children}</main>
    </div>
  );
}
