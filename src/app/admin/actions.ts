"use server";

import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/db";

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
