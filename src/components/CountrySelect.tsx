"use client";

/* Sélecteur de pays avec vrai drapeau (image, pas emoji — les emoji
   drapeau ne s'affichent pas correctement sur Windows). Un <select>
   natif ne peut pas afficher d'image dans ses <option>, d'où ce menu
   personnalisé. */

import { useEffect, useRef, useState } from "react";
import { COUNTRIES, type Country } from "@/lib/payment/countries";

function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${code.toLowerCase()}.png 2x`}
      width={24}
      height={18}
      alt=""
      className={className}
    />
  );
}

export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function select(c: Country) {
    onChange(c.code);
    setOpen(false);
  }

  // text-base (16px) et non text-sm : en dessous de 16px, iOS Safari zoome
  // automatiquement sur le champ au focus et ne dézoome pas correctement.
  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-base focus:border-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${field} flex items-center gap-2 text-left`}
      >
        <Flag code={selected.code} className="rounded-[3px]" />
        <span className="flex-1">{selected.name}</span>
        <span className="text-ink-faint">(+{selected.dial})</span>
        <span className={`text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-paper-line bg-paper py-1 shadow-pop"
        >
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                role="option"
                aria-selected={c.code === value}
                onClick={() => select(c)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-paper-soft ${
                  c.code === value ? "bg-paper-soft font-semibold" : ""
                }`}
              >
                <Flag code={c.code} className="rounded-[3px]" />
                <span className="flex-1">{c.name}</span>
                <span className="text-ink-faint">+{c.dial}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
