"use client";

import { useEffect } from "react";

export default function Error({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="display text-3xl">Une erreur est survenue</div>
      <p className="mt-2 max-w-sm text-ink-faint">
        Quelque chose s'est mal passé. Réessayez, le problème est peut-être temporaire.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-pill bg-ink px-6 py-3 text-sm font-semibold text-paper"
      >
        Réessayer
      </button>
    </div>
  );
}
