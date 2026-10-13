"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-store";
import { formatKM } from "@/lib/money";

type VariantLite = { id: string; label: string; priceCents: number };

export function AddToCart({
  slug,
  name,
  variants,
  compact = false,
}: {
  slug: string;
  name: string;
  variants: VariantLite[];
  compact?: boolean;
}) {
  const { add, maxQuantity } = useCart();
  const [variantId, setVariantId] = useState(variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const groupName = `variant-${slug}`;

  function onAdd() {
    add(`${slug}:${variant.id}`, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.length > 1 ? (
        <fieldset>
          <legend className="label">Veličina pakovanja</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label key={v.id} className="cursor-pointer">
                <input
                  type="radio"
                  name={groupName}
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 items-center gap-2 rounded-full border-2 border-line bg-surface px-4 py-1.5 font-semibold peer-checked:border-teal peer-checked:bg-mint peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal">
                  {v.label}
                  <span className="font-normal text-ink-soft">{formatKM(v.priceCents)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "pt-1"}`}>
        <div className="inline-flex items-center rounded-full border-2 border-line bg-surface" role="group" aria-label="Količina">
          <button
            type="button"
            className="h-11 w-11 rounded-full text-xl font-bold hover:bg-mint-soft disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Smanji količinu"
          >
            −
          </button>
          <span className="min-w-8 text-center font-bold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="h-11 w-11 rounded-full text-xl font-bold hover:bg-mint-soft disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Povećaj količinu"
          >
            +
          </button>
        </div>
        <button type="button" onClick={onAdd} className="btn btn-primary flex-1 sm:flex-none sm:min-w-56">
          {added ? "Dodano u korpu" : `Dodaj u korpu, ${formatKM(variant.priceCents * quantity)}`}
        </button>
      </div>

      <p role="status" className="min-h-6 text-[0.95rem]">
        {added ? (
          <>
            {name} je u korpi.{" "}
            <Link href="/korpa" className="font-semibold">
              Pregledaj korpu
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
