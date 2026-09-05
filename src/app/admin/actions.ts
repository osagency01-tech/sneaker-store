"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/db";

const IMAGE_BUCKET = "product-images";
const MAX_DIMENSION = 1400;
const WEBP_QUALITY = 82;
const IMAGE_CACHE_CONTROL = "604800";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const db = createAdminClient();
  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function updateVariantStock(variantId: string, stock: number) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const db = createAdminClient();
  const { error } = await db
    .from("product_variants")
    .update({ stock: Math.max(0, Math.floor(stock)) })
    .eq("id", variantId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProductStatus(productId: string, active: boolean) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const db = createAdminClient();
  const { error } = await db
    .from("products")
    .update({ status: active ? "active" : "draft" })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}

const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable(),
  description: z.string().trim().max(4000).nullable(),
});

/* Modifie les infos essentielles d'une chaussure — même table `products`
   que le reste du site : le nouveau prix est immédiatement visible sur la
   fiche produit, les cartes produits, le panier et le paiement (tous lisent
   `products.price` à la demande, aucune donnée dupliquée à synchroniser). */
export async function updateProduct(
  productId: string,
  input: { name: string; price: number; compareAtPrice: number | null; description: string | null }
) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const { name, price, compareAtPrice, description } = parsed.data;
  if (compareAtPrice !== null && compareAtPrice <= price) {
    return { ok: false, error: "Le prix barré doit être supérieur au prix de vente." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("products")
    .update({ name, price, compare_at_price: compareAtPrice, description })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addVariant(productId: string, size: string, stock: number) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const cleanSize = size.trim();
  if (!cleanSize) return { ok: false, error: "Pointure requise." };

  const db = createAdminClient();
  const { error } = await db.from("product_variants").insert({
    product_id: productId,
    size: cleanSize,
    stock: Math.max(0, Math.floor(stock)),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

async function ensureImageBucket(db: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.some((b) => b.name === IMAGE_BUCKET)) {
    await db.storage.createBucket(IMAGE_BUCKET, { public: true, fileSizeLimit: "10MB" }).catch(() => {});
  }
}

/* Ajoute une image produit à partir d'une URL externe : téléchargée,
   redimensionnée et compressée en WebP côté serveur, puis stockée dans
   notre bucket Supabase — jamais servie directement depuis l'URL externe
   d'origine (pas de dépendance à un domaine tiers, ni à l'optimisation
   d'images Vercel puisque next.config a `images.unoptimized: true`). */
export async function addProductImageFromUrl(productId: string, slug: string, imageUrl: string) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error("bad protocol");
  } catch {
    return { ok: false, error: "URL d'image invalide." };
  }

  let buf: Buffer;
  try {
    const res = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*,*/*;q=0.8" },
    });
    if (!res.ok) return { ok: false, error: `Téléchargement impossible (${res.status}).` };
    buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) return { ok: false, error: "Fichier téléchargé trop petit pour être une image." };
  } catch {
    return { ok: false, error: "Impossible de joindre cette URL." };
  }

  let outBuf: Buffer;
  try {
    outBuf = await sharp(buf)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return { ok: false, error: "Fichier invalide : ce n'est pas une image exploitable." };
  }

  const db = createAdminClient();
  await ensureImageBucket(db);

  const path = `${slug}/admin-${Date.now()}.webp`;
  const { error: uploadErr } = await db.storage.from(IMAGE_BUCKET).upload(path, outBuf, {
    contentType: "image/webp",
    cacheControl: IMAGE_CACHE_CONTROL,
    upsert: false,
  });
  if (uploadErr) return { ok: false, error: uploadErr.message };

  const { data: pub } = db.storage.from(IMAGE_BUCKET).getPublicUrl(path);

  const { count } = await db
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error: insertErr } = await db.from("product_images").insert({
    product_id: productId,
    url: pub.publicUrl,
    position: count ?? 0,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true, url: pub.publicUrl };
}

/* Retire une image de la fiche produit. Le fichier reste dans le bucket
   (pas de suppression physique irréversible depuis l'admin) — seule la
   ligne product_images qui l'affichait est supprimée. */
export async function deleteProductImage(imageId: string) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const db = createAdminClient();
  const { error } = await db.from("product_images").delete().eq("id", imageId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}
