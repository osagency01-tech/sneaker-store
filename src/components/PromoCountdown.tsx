"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

type PromoCountdownProps = {
  productId: string;
  onPromo: boolean;
};

const PROMO_DURATION_HOURS = 24;

export function PromoCountdown({
  productId,
  onPromo,
}: PromoCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!onPromo) {
      setRemaining(null);
      return;
    }

    const storageKey = `vantom-promo-end-${productId}`;

    let endTime = Number(localStorage.getItem(storageKey));

    /*
     * Première visite :
     * lancement du compte à rebours.
     */
    if (!Number.isFinite(endTime) || endTime <= Date.now()) {
      endTime =
        Date.now() +
        PROMO_DURATION_HOURS * 60 * 60 * 1000;

      localStorage.setItem(
        storageKey,
        String(endTime)
      );
    }

    const updateCountdown = () => {
      const value = endTime - Date.now();

      if (value <= 0) {
        setRemaining(0);
        localStorage.removeItem(storageKey);
        return;
      }

      setRemaining(value);
    };

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [productId, onPromo]);

  if (
    !onPromo ||
    remaining === null ||
    remaining <= 0
  ) {
    return null;
  }

  const totalSeconds = Math.floor(
    remaining / 1000
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  const countdown = [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");

  return (
    <div className="flex items-center justify-center gap-2 py-2.5 text-red-600">
      <Clock3
        size={15}
        strokeWidth={2.3}
        className="shrink-0"
      />

      <span className="text-[11px] font-semibold">
        Fin de promo
      </span>

      <span className="tech animate-vantom-cta text-[12px] font-bold tracking-wide">
        {countdown}
      </span>
    </div>
  );
}