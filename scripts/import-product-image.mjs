// Downloads a source image, uploads it to Supabase Storage (bucket "product-images"),
// then updates the matching product_images row (matched by its current placeholder url).
//
// Usage:
//   node scripts/import-product-image.mjs --old "<exact current url in DB>" --src "<real image url>" --slug "<product-slug>" --name "<file-name-no-ext>"

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

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, "")] = argv[i + 1];
  }
  return args;
}

const BUCKET = "product-images";

async function ensureBucket(supabase) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "10MB",
    });
    if (createErr && !/already exists/i.test(createErr.message)) throw createErr;
  }
}

function extFromContentType(ct) {
  if (!ct) return "jpg";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

async function main() {
  const { old: oldUrl, src, slug, name } = parseArgs();
  if (!oldUrl || !src || !slug || !name) {
    console.error(
      JSON.stringify({ ok: false, error: "missing required args: --old --src --slug --name" })
    );
    process.exit(1);
  }

  const env = parseEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  await ensureBucket(supabase);

  const res = await fetch(src, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      Referer: new URL(src).origin,
    },
  });
  if (!res.ok) {
    console.error(JSON.stringify({ ok: false, error: `fetch failed ${res.status}`, src }));
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) {
    console.error(
      JSON.stringify({ ok: false, error: "downloaded file too small, likely not a real image", src, bytes: buf.length })
    );
    process.exit(1);
  }
  const contentType = res.headers.get("content-type") || "image/jpeg";

  // Strip the studio/editorial background so the product sits on a transparent PNG.
  let finalBuf = buf;
  let finalContentType = contentType;
  let ext = extFromContentType(contentType);
  try {
    const mime = extFromContentType(contentType) === "png" ? "image/png"
      : extFromContentType(contentType) === "webp" ? "image/webp"
      : "image/jpeg";
    const cutoutBlob = await removeBackground(new Blob([buf], { type: mime }));
    finalBuf = Buffer.from(await cutoutBlob.arrayBuffer());
    finalContentType = "image/png";
    ext = "png";
  } catch (bgErr) {
    console.error(JSON.stringify({ warn: "background removal failed, uploading original", error: String(bgErr) }));
  }

  const path = `${slug}/${name}.${ext}`;

  const blob = new Blob([finalBuf], { type: finalContentType });
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: finalContentType,
    upsert: true,
  });
  if (uploadErr) {
    console.error(JSON.stringify({ ok: false, error: uploadErr.message }));
    process.exit(1);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { data: updated, error: updateErr } = await supabase
    .from("product_images")
    .update({ url: publicUrl })
    .eq("url", oldUrl)
    .select("id");
  if (updateErr) {
    console.error(JSON.stringify({ ok: false, error: updateErr.message }));
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      ok: true,
      path,
      publicUrl,
      bytes: finalBuf.length,
      updatedRows: updated.length,
    })
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err && err.stack || err) }));
  process.exit(1);
});
