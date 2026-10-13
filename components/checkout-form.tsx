"use client";

import Link from "next/link";
import { useActionState } from "react";
import { placeOrderAction } from "@/app/actions/checkout";
import { OrderSummary, useCartLines } from "./cart-view";
import { useHydrated } from "./cart-store";
import { ProductArt } from "./product-art";
import { formatKM } from "@/lib/money";
import type { FormState } from "@/lib/form-state";
import type { SkuInfo } from "@/lib/catalog";

type Props = {
  skuIndex: Record<string, SkuInfo>;
  shipping: { flatCents: number; freeOverCents: number };
  prefill: { name: string; email: string };
};

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : null}
    </div>
  );
}

export function CheckoutForm({ skuIndex, shipping, prefill }: Props) {
  const hydrated = useHydrated();
  const cart = useCartLines(skuIndex, shipping);
  const [state, action, pending] = useActionState<FormState, FormData>(placeOrderAction, {});
  const err = state.errors ?? {};
  const v = state.values ?? {};

  const props = (id: string, hint?: string) => ({
    id,
    name: id,
    "aria-invalid": err[id] ? (true as const) : undefined,
    "aria-describedby": err[id] ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: "field",
  });

  if (!hydrated) return <div className="card min-h-[40rem] animate-pulse bg-mint-soft" aria-hidden="true" />;

  if (cart.items.length === 0) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <h2 className="text-2xl">Nema artikala za naručivanje</h2>
        <p className="mb-6 mt-2 text-ink-soft">Dodajte proizvode u korpu pa se vratite ovdje.</p>
        <Link href="/korpa" className="btn btn-primary">Idi na korpu</Link>
      </div>
    );
  }

  const cartPayload = JSON.stringify(cart.lines.filter((l) => skuIndex[l.sku]).map((l) => ({ sku: l.sku, quantity: l.quantity })));

  return (
    <form action={action} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-8">
        {state.message ? (
          <p role="alert" className="rounded-xl border-2 border-coral bg-white px-4 py-3 font-semibold text-coral">
            {state.message}
          </p>
        ) : null}

        <fieldset className="card space-y-4 p-6">
          <legend className="float-left mb-4 w-full font-display text-xl font-bold">Podaci za dostavu</legend>
          <div className="clear-both grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Ime i prezime" error={err.name}>
              <input {...props("name")} type="text" autoComplete="name" defaultValue={v.name ?? prefill.name} />
            </Field>
            <Field id="email" label="E-mail" error={err.email} hint="Na ovu adresu šaljemo potvrdu narudžbe.">
              <input {...props("email", "x")} type="email" inputMode="email" autoComplete="email" defaultValue={v.email ?? prefill.email} />
            </Field>
            <Field id="phone" label="Telefon" error={err.phone} hint="Kurir vas zove prije dostave.">
              <input {...props("phone", "x")} type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} />
            </Field>
            <Field id="address" label="Adresa (ulica i broj)" error={err.address}>
              <input {...props("address")} type="text" autoComplete="street-address" defaultValue={v.address} />
            </Field>
            <Field id="city" label="Grad" error={err.city}>
              <input {...props("city")} type="text" autoComplete="address-level2" defaultValue={v.city} />
            </Field>
            <Field id="postalCode" label="Poštanski broj" error={err.postalCode}>
              <input {...props("postalCode")} type="text" inputMode="numeric" autoComplete="postal-code" maxLength={5} defaultValue={v.postalCode} />
            </Field>
          </div>
          <Field id="note" label="Napomena za kurira (neobavezno)" error={err.note}>
            <textarea {...props("note")} rows={3} maxLength={500} defaultValue={v.note} className="field min-h-24" />
          </Field>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="float-left mb-4 w-full font-display text-xl font-bold">Način plaćanja</legend>
          <label className="clear-both flex cursor-pointer items-start gap-3 rounded-xl border-2 border-teal bg-mint-soft p-4">
            <input type="radio" name="paymentMethod" value="pouzece" defaultChecked className="mt-1.5 h-5 w-5 accent-teal" />
            <span>
              <span className="block font-bold">Plaćanje pouzećem</span>
              <span className="block text-ink-soft">Gotovinom kuriru pri preuzimanju paketa.</span>
            </span>
          </label>
          {err.paymentMethod ? <p className="field-error">{err.paymentMethod}</p> : null}
        </fieldset>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              className="mt-1.5 h-5 w-5 shrink-0 accent-teal"
              aria-invalid={err.terms ? true : undefined}
              aria-describedby={err.terms ? "terms-error" : undefined}
            />
            <span>
              Pročitao/la sam i prihvatam <Link href="/uslovi-koristenja">uslove korištenja</Link> i{" "}
              <Link href="/politika-privatnosti">politiku privatnosti</Link>.
            </span>
          </label>
          {err.terms ? <p id="terms-error" className="field-error">{err.terms}</p> : null}
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="cart" value={cartPayload} />
      </div>

      <aside className="card p-6 lg:sticky lg:top-28" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" className="mb-4 text-xl">Vaša narudžba</h2>
        <ul className="mb-5 space-y-3">
          {cart.items.map((l) => (
            <li key={l.sku} className="flex items-center gap-3">
              <ProductArt pack={l.info.pack} tone={l.info.tone} pet={l.info.pet} image={l.info.image} className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 text-[0.95rem] leading-snug">
                <p className="line-clamp-2 font-semibold">{l.info.name}</p>
                <p className="text-ink-soft">{l.info.variant}, količina {l.quantity}</p>
              </div>
              <p className="text-[0.95rem] font-bold">{formatKM(l.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <OrderSummary subtotalCents={cart.subtotalCents} shippingCents={cart.shippingCents} totalCents={cart.totalCents} freeOverCents={shipping.freeOverCents} />
        <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full">
          {pending ? "Šaljem narudžbu..." : `Naruči, ${formatKM(cart.totalCents)}`}
        </button>
        <p className="mt-3 text-center text-sm text-ink-soft">
          <Link href="/korpa">Vrati se na korpu</Link>
        </p>
      </aside>
    </form>
  );
}
