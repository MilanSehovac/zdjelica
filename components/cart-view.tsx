"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart, useHydrated } from "./cart-store";
import { ProductArt } from "./product-art";
import { formatKM } from "@/lib/money";
import type { SkuInfo } from "@/lib/catalog";

type Props = {
  skuIndex: Record<string, SkuInfo>;
  shipping: { flatCents: number; freeOverCents: number };
};

export function useCartLines(skuIndex: Props["skuIndex"], shipping: Props["shipping"]) {
  const cart = useCart();
  const resolved = useMemo(() => {
    const items = cart.lines.flatMap((l) => {
      const info = skuIndex[l.sku];
      return info ? [{ ...l, info, lineTotalCents: info.priceCents * l.quantity }] : [];
    });
    const unknown = cart.lines.length - items.length;
    const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
    const shippingCents = subtotalCents === 0 || subtotalCents >= shipping.freeOverCents ? 0 : shipping.flatCents;
    return { items, unknown, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
  }, [cart.lines, skuIndex, shipping]);
  return { ...cart, ...resolved };
}

export function OrderSummary({
  subtotalCents,
  shippingCents,
  totalCents,
  freeOverCents,
}: {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeOverCents: number;
}) {
  const missing = freeOverCents - subtotalCents;
  return (
    <dl className="space-y-2">
      <div className="flex justify-between gap-4">
        <dt>Artikli</dt>
        <dd>{formatKM(subtotalCents)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Dostava</dt>
        <dd>{shippingCents === 0 ? "Besplatna" : formatKM(shippingCents)}</dd>
      </div>
      {shippingCents > 0 && missing > 0 ? (
        <p className="rounded-xl bg-mint-soft px-3 py-2 text-[0.93rem]">Još {formatKM(missing)} do besplatne dostave.</p>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
        <dt>Ukupno za platiti</dt>
        <dd>{formatKM(totalCents)}</dd>
      </div>
    </dl>
  );
}

export function CartView({ skuIndex, shipping }: Props) {
  const hydrated = useHydrated();
  const cart = useCartLines(skuIndex, shipping);

  if (!hydrated) {
    return <div className="card min-h-72 animate-pulse bg-mint-soft" aria-hidden="true" />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <h2 className="text-2xl">Korpa je prazna</h2>
        <p className="mx-auto mb-6 mt-2 max-w-md text-ink-soft">Odaberite hranu za svog ljubimca ili otvorite omiljene proizvode.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/pas" className="btn btn-primary">Hrana za pse</Link>
          <Link href="/macka" className="btn btn-primary">Hrana za mačke</Link>
          <Link href="/omiljeno" className="btn btn-outline">Omiljeno</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {cart.unknown > 0 ? (
          <p role="alert" className="mb-4 rounded-xl bg-butter/40 px-4 py-3">
            Neki proizvodi iz korpe više nisu dostupni pa su izostavljeni iz računa.
          </p>
        ) : null}
        <ul className="card divide-y divide-line">
          {cart.items.map((l) => (
            <li key={l.sku} className="flex gap-4 p-4">
              <ProductArt pack={l.info.pack} tone={l.info.tone} pet={l.info.pet} image={l.info.image} className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap justify-between gap-x-4">
                  <div className="min-w-0">
                    <h2 className="text-base leading-snug">
                      <Link href={`/proizvod/${l.info.slug}`} className="text-ink">{l.info.name}</Link>
                    </h2>
                    <p className="text-[0.95rem] text-ink-soft">Pakovanje: {l.info.variant}</p>
                  </div>
                  <p className="font-bold">{formatKM(l.lineTotalCents)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border-2 border-line bg-surface" role="group" aria-label={`Količina: ${l.info.name}`}>
                    <button type="button" className="h-10 w-10 rounded-full text-lg font-bold hover:bg-mint-soft" onClick={() => cart.setQuantity(l.sku, l.quantity - 1)} aria-label={`Smanji količinu: ${l.info.name}`}>−</button>
                    <span className="min-w-7 text-center font-bold" aria-live="polite">{l.quantity}</span>
                    <button type="button" className="h-10 w-10 rounded-full text-lg font-bold hover:bg-mint-soft disabled:opacity-40" onClick={() => cart.setQuantity(l.sku, l.quantity + 1)} disabled={l.quantity >= cart.maxQuantity} aria-label={`Povećaj količinu: ${l.info.name}`}>+</button>
                  </div>
                  <button type="button" onClick={() => cart.remove(l.sku)} className="min-h-10 rounded-full px-3 font-semibold text-coral underline underline-offset-4 hover:bg-mint-soft">
                    Ukloni
                    <span className="sr-only">: {l.info.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="card p-6 lg:sticky lg:top-28" aria-labelledby="summary-title">
        <h2 id="summary-title" className="mb-4 text-xl">Pregled narudžbe</h2>
        <OrderSummary subtotalCents={cart.subtotalCents} shippingCents={cart.shippingCents} totalCents={cart.totalCents} freeOverCents={shipping.freeOverCents} />
        <Link href="/placanje" className="btn btn-primary mt-5 w-full">Nastavi na plaćanje</Link>
        <p className="mt-3 text-center text-sm text-ink-soft">Plaćate pouzećem pri preuzimanju.</p>
      </aside>
    </div>
  );
}
