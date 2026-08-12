"use client";

/* ==================================================================== *
 *  Hero sneaker en lévitation — image détourée lumineuse + ombre douce
 *  + flottement. Emplacement prêt pour brancher une 3D desktop plus tard
 *  (voir HERO_3D_SLOT plus bas). Sur mobile, on garde TOUJOURS l'image
 *  (léger, instantané), conformément à l'exigence mobile-first.
 * ==================================================================== */

import Image from "next/image";

export function HeroSneaker({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      {/* Halo lumineux derrière la chaussure */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-3xl" />

      {/* HERO_3D_SLOT — pour brancher la 3D desktop en V2 :
          remplacer le bloc <Image> par un <Canvas> react-three-fiber
          rendu uniquement sur écran large (hidden lg:block). L'image
          reste le fallback mobile. */}
      {src ? (
        <div className="relative z-10 w-[86%] max-w-[520px] animate-floaty">
          <Image
            src={src}
            alt={alt}
            width={640}
            height={640}
            priority
            className="h-auto w-full object-contain drop-shadow-2xl"
          />
        </div>
      ) : (
        <div className="relative z-10 flex aspect-square w-[70%] max-w-[420px] animate-floaty items-center justify-center rounded-full bg-white/50 text-sm text-ink-faint">
          Image sneaker à venir
        </div>
      )}

      {/* Ombre portée douce, animée en phase avec le flottement */}
      <div className="absolute bottom-[14%] left-1/2 z-0 h-6 w-[46%] max-w-[300px] -translate-x-1/2 animate-floatyShadow rounded-[100%] bg-accent-ink/40 blur-xl" />
    </div>
  );
}
