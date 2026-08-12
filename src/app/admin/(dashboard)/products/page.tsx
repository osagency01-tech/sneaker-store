import { getAllProducts } from "@/lib/admin-data";
import { formatXOF } from "@/lib/format";
import { ProductRow } from "@/components/admin/ProductRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produits" };

export default async function AdminProducts() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl">Produits</h1>
        <span className="tech text-sm text-ink-faint">{products.length}</span>
      </div>

      <div className="mt-5 space-y-3">
        {products.map((p: any) => {
          const totalStock = (p.variants ?? []).reduce((s: number, v: any) => s + v.stock, 0);
          return (
            <ProductRow
              key={p.id}
              id={p.id}
              name={p.name}
              brand={p.brand}
              price={formatXOF(p.price)}
              category={p.category?.name ?? "—"}
              status={p.status}
              totalStock={totalStock}
              variants={p.variants ?? []}
            />
          );
        })}
        {products.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-faint">Aucun produit.</p>
        )}
      </div>
    </div>
  );
}
