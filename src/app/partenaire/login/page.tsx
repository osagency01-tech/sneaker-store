"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PartnerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const db = createClient();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Identifiants invalides.");
      setLoading(false);
      return;
    }
    router.push("/partenaire");
    router.refresh();
  }

  // text-base (16px) et non text-sm : en dessous de 16px, iOS Safari zoome
  // automatiquement sur le champ au focus et ne dézoome pas correctement.
  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-base focus:border-ink";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-soft px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-card border border-paper-line bg-paper p-6 shadow-card">
        <div className="display text-xl">VANTOM · Partenaire</div>
        <p className="mt-1 text-sm text-ink-faint">Accès réservé.</p>
        <div className="mt-5 space-y-3">
          <input type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" />
          <input type="password" required placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)} className={field} autoComplete="current-password" />
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button disabled={loading}
          className="mt-5 w-full rounded-pill bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
