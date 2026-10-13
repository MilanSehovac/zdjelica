import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { getOrderByPublicId, PAYMENT_METHODS, STATUS_LABELS } from "@/lib/orders";
import { orderNumber } from "@/lib/ids";
import { formatKM } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Narudžba",
  description: "Pregled vaše narudžbe.",
  path: "/narudzba",
  noindex: true,
});

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const { id } = await params;
  const { novo } = await searchParams;
  const order = getOrderByPublicId(id);
  if (!order) notFound();
  const user = await getCurrentUser();
  const c = order.customer;

  return (
    <div className="container-page max-w-3xl py-10">
      {novo === "1" ? <ClearCart /> : null}
      {novo === "1" ? (
        <div className="mb-8 rounded-[1.5rem] bg-mint p-6 md:p-8" role="status">
          <h1 className="text-[clamp(1.8rem,3vw+0.5rem,2.6rem)] text-teal-deep">Hvala, narudžba je primljena</h1>
          <p className="mt-3">
            Potvrdu smo poslali na <strong>{c.email}</strong>. Kurir će vas nazvati prije dostave, a očekivano vrijeme je {site.shipping.estimate}.
          </p>
        </div>
      ) : (
        <h1 className="mb-8 text-[clamp(1.8rem,3vw+0.5rem,2.6rem)]">Narudžba {orderNumber(order.id)}</h1>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="text-xl">Narudžba {orderNumber(order.id)}</h2>
          <p className="rounded-full bg-mint-soft px-3 py-1 text-sm font-bold">{STATUS_LABELS[order.status]}</p>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{formatDateTime(order.createdAt)}</p>

        <ul className="mt-5 divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-4 py-3">
              <span>
                {i.productName} <span className="text-ink-soft">({i.variantLabel}), količina {i.quantity}</span>
              </span>
              <span className="font-semibold">{formatKM(i.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3">
          <div className="flex justify-between"><dt>Dostava</dt><dd>{order.totals.shippingCents === 0 ? "Besplatna" : formatKM(order.totals.shippingCents)}</dd></div>
          <div className="flex justify-between text-lg font-bold"><dt>Ukupno za platiti</dt><dd>{formatKM(order.totals.totalCents)}</dd></div>
        </dl>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="card p-6" aria-labelledby="ship-title">
          <h2 id="ship-title" className="mb-2 text-lg">Adresa dostave</h2>
          <p>
            {c.name}<br />
            {c.address}<br />
            {c.postalCode} {c.city}<br />
            {c.phone}
          </p>
          {c.note ? <p className="mt-2 text-sm text-ink-soft">Napomena: {c.note}</p> : null}
        </section>
        <section className="card p-6" aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-2 text-lg">Plaćanje</h2>
          <p>{PAYMENT_METHODS[c.paymentMethod]}. Iznos plaćate kuriru pri preuzimanju.</p>
        </section>
      </div>

      {novo === "1" && !user ? (
        <div className="mt-8 rounded-[1.5rem] bg-surface p-6">
          <h2 className="text-xl">Sljedeći put naručite brže</h2>
          <p className="mb-4 mt-2 text-ink-soft">
            Sa računom možete sačuvati omiljene proizvode, označiti one koje uzimate redovno i dobiti podsjetnik prije nego vam ponestane.
          </p>
          <Link href="/registracija?next=/omiljeno" className="btn btn-dark">Napravite račun</Link>
        </div>
      ) : null}

      <p className="mt-8">
        <Link href="/" className="btn btn-outline">Nazad na početnu</Link>
      </p>
    </div>
  );
}
