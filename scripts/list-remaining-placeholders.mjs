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

const env = parseEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase
  .from("product_images")
  .select("url, position, products(slug)")
  .like("url", "%placehold.co%")
  .order("position");

if (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
}

const bySlug = {};
for (const row of data) {
  const slug = row.products?.slug ?? "?";
  (bySlug[slug] ??= []).push({ position: row.position, url: row.url });
}

console.log(`Remaining placeholder rows: ${data.length}`);
for (const [slug, rows] of Object.entries(bySlug)) {
  console.log(`\n${slug} (${rows.length}):`);
  for (const r of rows) console.log(`  ${r.position}: ${r.url}`);
}
