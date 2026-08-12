// Re-downloads every product_images row already hosted on our Supabase Storage bucket,
// strips the background (transparent PNG), re-uploads, and updates the DB url.
// Skips rows still pointing at placehold.co (nothing to reprocess there).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { removeBackground } from "@imgly/background-removal-node";

function parseEnvLocal() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/\s+#.*$/, "").trim();
  }
  return env;
}

const BUCKET = "product-images";
const env = parseEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function mimeFromUrl(url) {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function main() {
  const { data: rows, error } = await supabase
    .from("product_images")
    .select("id, url")
    .not("url", "like", "%placehold.co%")
    .order("id");
  if (error) throw error;

  console.log(`Reprocessing ${rows.length} rows...`);
  let done = 0, failed = 0;

  for (const row of rows) {
    try {
      const res = await fetch(row.url);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = mimeFromUrl(row.url);

      const cutout = await removeBackground(new Blob([buf], { type: mime }));
      const outBuf = Buffer.from(await cutout.arrayBuffer());

      // path = everything after the bucket name in the public URL, with .png extension
      const marker = `/object/public/${BUCKET}/`;
      const idx = row.url.indexOf(marker);
      const oldPath = decodeURIComponent(row.url.slice(idx + marker.length));
      const newPath = oldPath.replace(/\.(jpg|jpeg|webp|png|gif)$/i, "") + ".png";

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, new Blob([outBuf], { type: "image/png" }), {
          contentType: "image/png",
          upsert: true,
        });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
      const { error: updateErr } = await supabase
        .from("product_images")
        .update({ url: pub.publicUrl })
        .eq("id", row.id);
      if (updateErr) throw updateErr;

      // clean up old file if the path/extension changed
      if (newPath !== oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }

      done++;
      console.log(`OK  [${done}/${rows.length}] ${newPath}`);
    } catch (err) {
      failed++;
      console.error(`FAIL ${row.url} -> ${String(err && err.message || err)}`);
    }
  }

  console.log(`\nDone. ok=${done} failed=${failed}`);
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
