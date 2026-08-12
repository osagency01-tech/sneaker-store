// Idempotent seed for the "Nike Tn Spécial" product: product row, 25 colorway
// image placeholders (position 0 = doernbecher, so it becomes the homepage
// hero once this is the newest active product), and size variants 38-44.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnvLocal() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/\s+#.*$/, "").trim();
  }
  return env;
}

const SLUG = "nike-tn-special";
const PRICE = 21500;

const COLORWAYS = [
  ["doernbecher", "Doernbecher"],
  ["bleached-aqua", "Bleached Aqua"],
  ["hyper-blue-og", "Hyper Blue OG"],
  ["sunset-og", "Sunset OG"],
  ["voltage-purple", "Voltage Purple"],
  ["tiger", "Tiger / Tiger OG"],
  ["25th-anniversary", "25th Anniversary"],
  ["paris", "Paris / Paris Edition"],
  ["tiffany", "Tiffany / Tiffany Blue"],
  ["black-flames", "Black Flames"],
  ["eclair-lightning", "Éclair Lightning"],
  ["aqua", "Aqua"],
  ["sky-blue", "Sky Blue"],
  ["grape", "Grape"],
  ["rainbow", "Rainbow"],
  ["volt", "Volt"],
  ["atomic-pink", "Atomic Pink"],
  ["team-orange", "Team Orange"],
  ["pure-platinum", "Pure Platinum"],
  ["triple-black", "Triple Black"],
  ["white-tiger", "White Tiger"],
  ["hyper-jade", "Hyper Jade"],
  ["university-red", "University Red"],
  ["sunset-pulse", "Sunset Pulse"],
  ["laser-blue", "Laser Blue"],
];

const SIZES = ["38", "39", "40", "41", "42", "43", "44"];

const env = parseEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "sneakers")
    .single();
  if (catErr) throw catErr;

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .upsert(
      {
        name: "Tn Spécial",
        slug: SLUG,
        brand: "Nike",
        description: "Nike Tn Spécial",
        price: PRICE,
        category_id: cat.id,
        status: "active",
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  if (prodErr) throw prodErr;
  const productId = product.id;

  // Clean re-seed of images/variants so this script stays idempotent.
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_variants").delete().eq("product_id", productId);

  const imageRows = COLORWAYS.map(([slug], position) => ({
    product_id: productId,
    url: `https://placehold.co/1200x1200/png?text=nike+tn-special+${slug}`,
    position,
  }));
  const { error: imgErr } = await supabase.from("product_images").insert(imageRows);
  if (imgErr) throw imgErr;

  const variantRows = SIZES.map((size) => ({
    product_id: productId,
    size,
    sku: `${SLUG}-${size}`,
    stock: 10,
  }));
  const { error: varErr } = await supabase.from("product_variants").insert(variantRows);
  if (varErr) throw varErr;

  console.log(JSON.stringify({ ok: true, productId, images: imageRows.length, variants: variantRows.length }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String((err && err.message) || err) }));
  process.exit(1);
});
