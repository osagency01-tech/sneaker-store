import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="display text-6xl text-ink">404</div>
      <p className="mt-2 text-ink-faint">Cette page n'existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="mt-6 rounded-pill bg-ink px-6 py-3 text-sm font-semibold text-paper"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
