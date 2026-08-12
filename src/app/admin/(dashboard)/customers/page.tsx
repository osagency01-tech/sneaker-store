import { getAllCustomers } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients" };

export default async function AdminCustomers() {
  const customers = await getAllCustomers();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl">Clients</h1>
        <span className="tech text-sm text-ink-faint">{customers.length}</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-card border border-paper-line bg-paper">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-paper-line text-left text-ink-faint">
              <tr>
                <th className="p-3 font-medium">Nom</th>
                <th className="p-3 font-medium">Téléphone</th>
                <th className="p-3 font-medium">Ville</th>
                <th className="p-3 font-medium">Commandes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-line">
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-paper-soft">
                  <td className="p-3">{c.full_name}</td>
                  <td className="p-3 tech text-xs">{c.phone}</td>
                  <td className="p-3 text-ink-soft">{c.city} ({c.country})</td>
                  <td className="p-3 tech">{c.orders?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-faint">Aucun client.</p>
        )}
      </div>
    </div>
  );
}
