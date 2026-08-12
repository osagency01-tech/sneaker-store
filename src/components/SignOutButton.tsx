"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ redirectTo, className }: { redirectTo: string; className?: string }) {
  const router = useRouter();
  async function signOut() {
    const db = createClient();
    await db.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }
  return (
    <button type="button" onClick={signOut} className={className}>
      Déconnexion
    </button>
  );
}
