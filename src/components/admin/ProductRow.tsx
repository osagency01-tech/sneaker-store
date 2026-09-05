"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  updateVariantStock,
  toggleProductStatus,
  updateProduct,
  addVariant,
  addProductImageFromUrl,
  deleteProductImage,
} from "@/app/admin/actions";
import { formatXOF } from "@/lib/format";

type Variant = { id: string; size: string; stock: number };
type ProductImage = { id: string; url: string; position: number };

export function ProductRow({
  id, slug, name, brand, price, compareAtPrice, description, category, status, totalStock, variants, images,
}: {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  category: string;
  status: string;
  totalStock: number;
  variants: Variant[];
  images: ProductImage[];
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
            {brand ? `${brand} · ` : ""}{category} · <span className="tech">{formatXOF(price)}</span> ·{" "}
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
        <div className="space-y-6 border-t border-paper-line p-4">
          <EditProductForm
            id={id}
            name={name}
            price={price}
            compareAtPrice={compareAtPrice}
            description={description}
          />

          <div>
            <div className="eyebrow mb-2">Images</div>
            <ImageManager productId={id} slug={slug} images={images} />
          </div>

          <div>
            <div className="eyebrow mb-2">Stock par pointure — cliquez sur ✓ pour enregistrer</div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {variants
                .slice()
                .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }))
                .map((v) => (
                  <StockInput key={v.id} variant={v} />
                ))}
            </div>
            <AddVariantForm productId={id} />
          </div>
        </div>
      )}
    </div>
  );
}

function EditProductForm({
  id, name, price, compareAtPrice, description,
}: {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
}) {
  const [form, setForm] = useState({
    name,
    price: String(price),
    compareAtPrice: compareAtPrice ? String(compareAtPrice) : "",
    description: description ?? "",
  });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty =
    form.name !== name ||
    form.price !== String(price) ||
    form.compareAtPrice !== (compareAtPrice ? String(compareAtPrice) : "") ||
    form.description !== (description ?? "");

  function save() {
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setMsg({ ok: false, text: "Prix invalide." });
      return;
    }
    const compareNum = form.compareAtPrice.trim() === "" ? null : Number(form.compareAtPrice);
    if (compareNum !== null && (!Number.isFinite(compareNum) || compareNum < 0)) {
      setMsg({ ok: false, text: "Prix barré invalide." });
      return;
    }
    start(async () => {
      const res = await updateProduct(id, {
        name: form.name,
        price: Math.round(priceNum),
        compareAtPrice: compareNum === null ? null : Math.round(compareNum),
        description: form.description.trim() === "" ? null : form.description,
      });
      setMsg(res.ok ? { ok: true, text: "Enregistré ✓" } : { ok: false, text: res.error ?? "Erreur" });
      if (res.ok) setTimeout(() => setMsg(null), 1800);
    });
  }

  const field = "w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm";

  return (
    <div>
      <div className="eyebrow mb-2">Informations produit</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-ink-faint">Nom</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Prix (XOF)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className={`tech ${field}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Prix barré (promo)</label>
            <input
              type="number"
              min={0}
              placeholder="—"
              value={form.compareAtPrice}
              onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              className={`tech ${field}`}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-ink-faint">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className={field}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-pill bg-ink px-4 py-2 text-xs font-semibold text-paper disabled:opacity-40"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {msg && <span className={`text-xs ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}

function ImageManager({ productId, slug, images }: { productId: string; slug: string; images: ProductImage[] }) {
  const [url, setUrl] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function add() {
    if (!url.trim()) return;
    start(async () => {
      const res = await addProductImageFromUrl(productId, slug, url.trim());
      setMsg(res.ok ? { ok: true, text: "Image ajoutée ✓" } : { ok: false, text: res.error ?? "Erreur" });
      if (res.ok) setUrl("");
      setTimeout(() => setMsg(null), 2500);
    });
  }

  function remove(imageId: string) {
    setDeletingId(imageId);
    start(async () => {
      await deleteProductImage(imageId);
      setDeletingId(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-paper-line bg-paper-soft">
            <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
            <button
              onClick={() => remove(img.id)}
              disabled={pending && deletingId === img.id}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-[10px] text-paper opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Retirer cette image"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-xs text-ink-faint">Aucune image.</p>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... (URL de l'image à importer)"
          className="min-w-[220px] flex-1 rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          disabled={pending || !url.trim()}
          className="rounded-pill border border-ink px-4 py-2 text-xs font-semibold disabled:opacity-40"
        >
          {pending ? "Import…" : "Ajouter"}
        </button>
        {msg && <span className={`text-xs ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</span>}
      </div>
      <p className="mt-1.5 text-[11px] text-ink-faint">
        L'image est téléchargée, redimensionnée et stockée dans notre bucket — elle ne dépend plus jamais du site source.
      </p>
    </div>
  );
}

function AddVariantForm({ productId }: { productId: string }) {
  const [size, setSize] = useState("");
  const [stock, setStock] = useState(0);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    if (!size.trim()) return;
    start(async () => {
      const res = await addVariant(productId, size.trim(), stock);
      setMsg(res.ok ? "Pointure ajoutée ✓" : res.error ?? "Erreur");
      if (res.ok) { setSize(""); setStock(0); }
      setTimeout(() => setMsg(null), 1800);
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={size}
        onChange={(e) => setSize(e.target.value)}
        placeholder="Nouvelle pointure (ex. 45)"
        className="tech w-40 rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
      />
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
        className="tech w-24 rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
      />
      <button
        onClick={save}
        disabled={pending || !size.trim()}
        className="rounded-pill border border-ink px-4 py-2 text-xs font-semibold disabled:opacity-40"
      >
        Ajouter
      </button>
      {msg && <span className="text-xs text-ok">{msg}</span>}
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
          className="tech w-full rounded-md border border-paper-line px-1 py-1 text-center text-base"
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
