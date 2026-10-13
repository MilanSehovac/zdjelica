"use client";

import { useActionState, useRef, useState } from "react";
import { createProductAction, updateProductAction } from "@/app/actions/products";
import { ProductArt } from "@/components/product-art";
import { CATEGORIES, PETS, type Product } from "@/lib/catalog";
import { PACK_OPTIONS, TONE_OPTIONS, centsToInput, type VariantRow } from "@/lib/product-form";
import type { FormState } from "@/lib/form-state";

function Err({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="field-error">
      {text}
    </p>
  ) : null;
}

let rowKey = 0;
const newRow = (r: Partial<VariantRow> = {}): VariantRow & { key: number } => ({ key: ++rowKey, id: "", label: "", price: "", ...r });

/** Smanjuje i kadrira fotografiju u kvadrat (WebP, najviše 1000 px) prije slanja, pa je upload brz i stranice ostaju lagane. */
async function prepareImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const out = Math.min(1000, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, out, out);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") return file;
    return new File([blob], "proizvod.webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ProductForm({ product }: { product?: Product }) {
  const editing = Boolean(product);
  const [state, action, pending] = useActionState<FormState, FormData>(editing ? updateProductAction : createProductAction, {});
  const err = state.errors ?? {};
  const v = state.values;

  const initial = (key: string, fallback: string) => v?.[key] ?? fallback;
  const [rows, setRows] = useState(() =>
    product
      ? product.variants.map((x) => newRow({ id: x.id, label: x.label, price: centsToInput(x.priceCents) }))
      : [newRow()],
  );
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [removeImage, setRemoveImage] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const ready = await prepareImage(file);
    const dt = new DataTransfer();
    dt.items.add(ready);
    input.files = dt.files;
    setPreview(URL.createObjectURL(ready));
    setRemoveImage(false);
  }

  const setRow = (key: number, patch: Partial<VariantRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const flag = (key: "featured" | "active", fallback: boolean) => (v ? v[key] === "on" : fallback);

  return (
    <form action={action} noValidate className="space-y-8">
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}
      {state.message ? (
        <p role="alert" className="rounded-xl border-2 border-coral bg-white px-4 py-3 font-semibold text-coral">
          {state.message}
        </p>
      ) : null}

      <fieldset className="card space-y-5 p-5">
        <legend className="px-2 text-lg font-bold">Osnovno</legend>
        <div>
          <label htmlFor="name" className="label">Naziv</label>
          <input id="name" name="name" className="field" defaultValue={initial("name", product?.name ?? "")} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "name-error" : undefined} />
          <Err id="name-error" text={err.name} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pet" className="label">Za koga</label>
            <select id="pet" name="pet" className="field" defaultValue={initial("pet", product?.pet ?? "pas")}>
              {Object.values(PETS).map((p) => (
                <option key={p.slug} value={p.slug}>{p.label}</option>
              ))}
            </select>
            <Err id="pet-error" text={err.pet} />
          </div>
          <div>
            <label htmlFor="category" className="label">Kategorija</label>
            <select id="category" name="category" className="field" defaultValue={initial("category", product?.category ?? "suha-hrana")}>
              {Object.values(CATEGORIES).map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <Err id="category-error" text={err.category} />
          </div>
        </div>
        <div>
          <label htmlFor="short" className="label">Kratki opis</label>
          <input id="short" name="short" className="field" maxLength={160} defaultValue={initial("short", product?.short ?? "")} aria-invalid={err.short ? true : undefined} aria-describedby="short-hint" />
          <p id="short-hint" className="mt-1 text-sm text-ink-soft">Jedna rečenica, vidi se na kartici proizvoda i u pretrazi.</p>
          <Err id="short-error" text={err.short} />
        </div>
        <div>
          <label htmlFor="description" className="label">Opis</label>
          <textarea id="description" name="description" rows={7} className="field" defaultValue={initial("description", product?.description.join("\n\n") ?? "")} aria-invalid={err.description ? true : undefined} aria-describedby="description-hint" />
          <p id="description-hint" className="mt-1 text-sm text-ink-soft">Prazan red odvaja pasuse.</p>
          <Err id="description-error" text={err.description} />
        </div>
        <div>
          <label htmlFor="highlights" className="label">Prednosti (opcionalno)</label>
          <textarea id="highlights" name="highlights" rows={4} className="field" defaultValue={initial("highlights", product?.highlights.join("\n") ?? "")} aria-invalid={err.highlights ? true : undefined} aria-describedby="highlights-hint" />
          <p id="highlights-hint" className="mt-1 text-sm text-ink-soft">Jedna prednost po redu, najviše 6.</p>
          <Err id="highlights-error" text={err.highlights} />
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5" aria-describedby={err.variants ? "variants-error" : undefined}>
        <legend className="px-2 text-lg font-bold">Varijante i cijene</legend>
        <p className="text-sm text-ink-soft">Svaka varijanta je zasebno pakovanje (npr. 3 kg i 12 kg). Cijena je u KM, npr. 14,90.</p>
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.key} className="grid grid-cols-[1fr_7.5rem_auto] items-end gap-3">
              <input type="hidden" name="variantId" value={r.id} />
              <div>
                <label htmlFor={`vl-${r.key}`} className="label">Naziv {i + 1}</label>
                <input id={`vl-${r.key}`} name="variantLabel" className="field" value={r.label} onChange={(e) => setRow(r.key, { label: e.target.value })} placeholder="npr. 3 kg" />
              </div>
              <div>
                <label htmlFor={`vp-${r.key}`} className="label">Cijena (KM)</label>
                <input id={`vp-${r.key}`} name="variantPrice" inputMode="decimal" className="field" value={r.price} onChange={(e) => setRow(r.key, { price: e.target.value })} placeholder="14,90" />
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                disabled={rows.length === 1}
                aria-label={`Ukloni varijantu ${i + 1}`}
              >
                Ukloni
              </button>
            </li>
          ))}
        </ul>
        <Err id="variants-error" text={err.variants} />
        {rows.length < 8 ? (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setRows((rs) => [...rs, newRow()])}>
            Dodaj varijantu
          </button>
        ) : null}
        <div className="max-w-xs">
          <label htmlFor="intervalWeeks" className="label">Jedno pakovanje traje (sedmica)</label>
          <input id="intervalWeeks" name="intervalWeeks" type="number" min={1} max={26} className="field" defaultValue={initial("intervalWeeks", String(product?.intervalWeeks ?? 4))} aria-invalid={err.intervalWeeks ? true : undefined} aria-describedby="interval-hint" />
          <p id="interval-hint" className="mt-1 text-sm text-ink-soft">Predlaže razmak za redovnu narudžbu i podsjetnik.</p>
          <Err id="intervalWeeks-error" text={err.intervalWeeks} />
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="px-2 text-lg font-bold">Fotografija</legend>
        <div className="flex flex-wrap items-start gap-5">
          <div className="shrink-0">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pregled nove fotografije" width={160} height={160} className="h-40 w-40 rounded-2xl bg-mint object-cover" />
            ) : (
              <ProductArt
                pack={(v?.pack as Product["pack"]) ?? product?.pack ?? "bag"}
                tone={(Number(v?.tone ?? product?.tone ?? 0) as Product["tone"]) ?? 0}
                pet={(v?.pet as Product["pet"]) ?? product?.pet ?? "pas"}
                image={removeImage ? null : product?.image}
                className="h-40 w-40 rounded-2xl"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 basis-64 space-y-3">
            <div>
              <label htmlFor="image" className="label">{product?.image ? "Zamijeni fotografiju" : "Učitaj fotografiju"}</label>
              <input ref={fileRef} id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="field" aria-describedby="image-hint" aria-invalid={err.image ? true : undefined} />
              <p id="image-hint" className="mt-1 text-sm text-ink-soft">JPG, PNG ili WebP. Automatski se kadrira u kvadrat i smanjuje. Bez fotografije prikazuje se ilustracija pakovanja.</p>
              <Err id="image-error" text={err.image} />
            </div>
            {product?.image ? (
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" name="removeImage" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} className="h-5 w-5 accent-teal" />
                <span>Ukloni trenutnu fotografiju</span>
              </label>
            ) : null}
          </div>
        </div>
        <details className="rounded-xl bg-mint-soft p-4">
          <summary className="cursor-pointer font-semibold">Ilustracija pakovanja (kad nema fotografije)</summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pack" className="label">Oblik</label>
              <select id="pack" name="pack" className="field" defaultValue={initial("pack", product?.pack ?? "bag")}>
                {PACK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tone" className="label">Boja</label>
              <select id="tone" name="tone" className="field" defaultValue={initial("tone", String(product?.tone ?? 0))}>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </fieldset>

      <fieldset className="card space-y-3 p-5">
        <legend className="px-2 text-lg font-bold">Prikaz</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="active" defaultChecked={flag("active", product?.active ?? true)} className="mt-1.5 h-5 w-5 shrink-0 accent-teal" />
          <span><strong>Vidljiv u shopu</strong><br /><span className="text-sm text-ink-soft">Ako isključite, proizvod se sakriva i ne može se naručiti, ali ostaje ovdje.</span></span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="featured" defaultChecked={flag("featured", product?.featured ?? false)} className="mt-1.5 h-5 w-5 shrink-0 accent-teal" />
          <span><strong>Prikaži na početnoj stranici</strong></span>
        </label>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Čuvanje..." : editing ? "Sačuvaj izmjene" : "Dodaj proizvod"}
        </button>
      </div>
    </form>
  );
}
