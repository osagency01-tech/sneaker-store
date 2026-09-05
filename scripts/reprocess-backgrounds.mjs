// Re-downloads every product_images row already hosted on our Supabase Storage bucket,
// strips the background (transparent PNG), resizes it to a sane web size, re-encodes
// as WebP, re-uploads with a long cache-control, and updates the DB url.
// Skips rows still pointing at placehold.co (nothing to reprocess there).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

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
// Longest edge in pixels — largement suffisant pour un plein écran mobile/desktop
// en affichage "object-contain" dans une carte carrée, sans télécharger un poids inutile.
const MAX_DIMENSION = 1400;
const WEBP_QUALITY = 82;
// 7 jours : assez long pour profiter du cache navigateur/CDN, assez court pour
// qu'une image remplacée par l'admin ne reste pas bloquée trop longtemps.
const CACHE_CONTROL = "604800";

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
  let done = 0, failed = 0, bytesBefore = 0, bytesAfter = 0;

  for (const row of rows) {
    try {
      const res = await fetch(row.url);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      bytesBefore += buf.length;
      const mime = mimeFromUrl(row.url);

      // L'image est déjà détourée si elle a déjà été traitée (canal alpha présent) ;
      // on repasse quand même par removeBackground pour rester idempotent si la
      // source d'origine n'était pas encore détourée.
      const cutout = await removeBackground(new Blob([buf], { type: mime }));
      const cutoutBuf = Buffer.from(await cutout.arrayBuffer());

      const outBuf = await sharp(cutoutBuf)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      bytesAfter += outBuf.length;

      // path = everything after the bucket name in the public URL, with .webp extension
      const marker = `/object/public/${BUCKET}/`;
      const idx = row.url.indexOf(marker);
      const oldPath = decodeURIComponent(row.url.slice(idx + marker.length));
      const newPath = oldPath.replace(/\.(jpg|jpeg|webp|png|gif)$/i, "") + ".webp";

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, new Blob([outBuf], { type: "image/webp" }), {
          contentType: "image/webp",
          cacheControl: CACHE_CONTROL,
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
      console.log(`OK  [${done}/${rows.length}] ${newPath} (${buf.length}B -> ${outBuf.length}B)`);
    } catch (err) {
      failed++;
      console.error(`FAIL ${row.url} -> ${String(err && err.message || err)}`);
    }
  }

  console.log(`\nDone. ok=${done} failed=${failed}`);
  if (bytesBefore > 0) {
    const pct = Math.round((1 - bytesAfter / bytesBefore) * 100);
    console.log(`Total size: ${bytesBefore}B -> ${bytesAfter}B (-${pct}%)`);
  }
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
