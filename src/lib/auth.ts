/* Garde admin — vérifie session Supabase + rôle dans profiles.
   Utilisé par le layout admin. */
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;
  return { user, profile };
}

/* Garde partenaire — même mécanisme que getAdmin(), rôle "partner". */
export async function getPartner() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "partner") return null;
  return { user, profile };
}
