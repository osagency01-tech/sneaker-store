// One-off: creates the admin and partner Supabase Auth users + their
// profiles rows. Safe to re-run (skips/updates if the email already exists).
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
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

function genPassword() {
  return randomBytes(9).toString("base64url"); // ~12 chars, url-safe
}

const env = parseEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ACCOUNTS = [
  { email: "admin@vantom.store", role: "admin", full_name: "Admin Vantom" },
  { email: "partenaire@vantom.store", role: "partner", full_name: "Partenaire Vantom" },
];

async function main() {
  const results = [];
  for (const acc of ACCOUNTS) {
    const password = genPassword();
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password,
      email_confirm: true,
    });
    if (error) {
      results.push({ ...acc, ok: false, error: error.message });
      continue;
    }
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert({ id: data.user.id, role: acc.role, full_name: acc.full_name }, { onConflict: "id" });
    if (profErr) {
      results.push({ ...acc, ok: false, error: profErr.message });
      continue;
    }
    results.push({ email: acc.email, role: acc.role, password, ok: true });
  }
  console.log(JSON.stringify(results, null, 2));
}

main();
