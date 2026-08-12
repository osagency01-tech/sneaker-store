"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/db";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-gradient-to-b from-paper-soft to-white">
        {main ? (
          <Image
            src={main.url}
            alt={name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-contain p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">—</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-paper-soft transition-all sm:w-[76px] ${
                i === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Voir l'image ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
