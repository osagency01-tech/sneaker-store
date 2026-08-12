"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/store";

const LINKS = [
  ["/shop", "Boutique"],
  ["/shop?cat=sneakers", "Sneakers"],
  ["/shop?cat=boots", "Boots"],
  ["/shop?cat=designer", "Designer"],
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-app items-center gap-3 px-4 h-16">
        {/* Burger mobile */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg sm:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 block h-0.5 w-5 bg-ink transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-ink transition-all ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 block h-0.5 w-5 bg-ink transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>

        <Link href="/" className="display text-2xl tracking-[-0.04em] text-ink" onClick={() => setOpen(false)}>
          vantom<span className="text-accent">.</span>
        </Link>

        <nav className="ml-8 hidden gap-7 text-sm font-medium text-ink-soft sm:flex">
          {LINKS.map(([href, label]) => (
            <Link key={label} href={href} className="hover:text-ink">{label}</Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative ml-auto inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2 text-sm font-semibold text-paper"
          onClick={() => setOpen(false)}
        >
          Panier
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] tech">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Panneau mobile */}
      {open && (
        <div className="border-t border-paper-line bg-paper sm:hidden">
          <nav className="mx-auto flex max-w-app flex-col px-4 py-2">
            {LINKS.map(([href, label]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-paper-line py-3 text-base font-medium text-ink last:border-0"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
