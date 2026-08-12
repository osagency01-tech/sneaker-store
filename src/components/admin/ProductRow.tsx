"use client";

import { useState, useTransition } from "react";
import { updateVariantStock, toggleProductStatus } from "@/app/admin/actions";

type Variant = { id: string; size: string; stock: number };

export function ProductRow({
  id, name, brand, price, category, status, totalStock, variants,
}: {
  id: string;
  name: string;
  brand: string | null;
  price: string;
  category: string;
  status: string;
  totalStock: number;
  variants: Variant[];
}) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(status === "active");
  const [pending, start] = useTransition();

  return (
    <div className="rounded-card border border-paper-line bg-paper">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left">
          <div className="font-display font-semibold">{name}</div>
          <div className="text-xs text-ink-faint">
            {brand ? `${brand} · ` : ""}{category} · <span className="tech">{price}</span> ·{" "}
            stock <span className="tech">{totalStock}</span>
          </div>
        </button>
        <label className="flex items-center gap-2 text-xs">
          <span className={isActive ? "text-ok" : "text-ink-faint"}>
            {isActive ? "Actif" : "Brouillon"}
          </span>
          <input
            type="checkbox"
            checked={isActive}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked;
              setIsActive(next);
              start(() => { toggleProductStatus(id, next); });
            }}
          />
        </label>
        <span className="text-ink-faint">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="border-t border-paper-line p-4">
          <div className="eyebrow mb-2">Stock par pointure — cliquez sur ✓ pour enregistrer</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {variants
              .slice()
              .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }))
              .map((v) => (
                <StockInput key={v.id} variant={v} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StockInput({ variant }: { variant: Variant }) {
  const [value, setValue] = useState(variant.stock);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const dirty = value !== variant.stock;

  function save() {
    start(async () => {
      const res = await updateVariantStock(variant.id, value);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1200);
      }
    });
  }

  return (
    <div className="rounded-xl border border-paper-line p-2 text-center">
      <div className="tech text-xs text-ink-faint">{variant.size}</div>
      <div className="mt-1 flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
          className="tech w-full rounded-md border border-paper-line px-1 py-1 text-center text-sm"
        />
        {dirty && (
          <button
            onClick={save}
            disabled={pending}
            className="rounded-md bg-ink px-2 py-1 text-xs text-paper"
            aria-label="Enregistrer"
          >
            ✓
          </button>
        )}
      </div>
      {saved && <div className="mt-0.5 text-[10px] text-ok">enregistré</div>}
    </div>
  );
}
