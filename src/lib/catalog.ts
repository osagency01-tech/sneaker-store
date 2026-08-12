/* Lecture du catalogue — Server Components, client serveur (RLS : ne
   renvoie que les produits actifs au public). */
import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations, Category } from "@/types/db";

export async function getCategories(): Promise<Category[]> {
  const db = createClient();
  const { data } = await db.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getProducts(opts?: {
  categorySlug?: string;
  query?: string;
}): Promise<ProductWithRelations[]> {
  const db = createClient();
  let q = db
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (opts?.query) q = q.ilike("name", `%${opts.query}%`);

  const { data } = await q;
  let list = (data ?? []) as unknown as ProductWithRelations[];

  if (opts?.categorySlug) {
    list = list.filter((p) => p.category?.slug === opts.categorySlug);
  }
  // tri des images et variantes
  for (const p of list) {
    p.images?.sort((a, b) => a.position - b.position);
    p.variants?.sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
  }
  return list;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const db = createClient();
  const { data } = await db
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  if (!data) return null;
  const p = data as unknown as ProductWithRelations;
  p.images?.sort((a, b) => a.position - b.position);
  p.variants?.sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
  return p;
}
