import Link from "next/link";
import { setRegularAction } from "@/app/actions/favorites";
import { AddToCart } from "@/components/add-to-cart";
import { HeartButton } from "@/components/heart-button";
import { ProductArt } from "@/components/product-art";
import { productUrl } from "@/lib/catalog";
import { getProduct } from "@/lib/products";
import { INTERVAL_OPTIONS, listFavorites } from "@/lib/favorites";
import { lastOrderDateBySlug } from "@/lib/orders";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/session";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Omiljeni proizvodi", description: "Vaši sačuvani proizvodi.", path: "/omiljeno", noindex: true });

const DAY = 24 * 60 * 60 * 1000;

export default async function FavoritesPage() {
  const user = await requireUser("/omiljeno");
  const favorites = listFavorites(user.id);
  const lastOrders = lastOrderDateBySlug(user.id);

  return (
    <div className="container-page py-10">
      <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Omiljeni proizvodi</h1>
      <p className="mb-8 mt-2 max-w-2xl text-ink-soft">
        Označite proizvode koje uzimate redovno i odaberite razmak. Prije nego vam ponestane, pošaljemo e-mail sa linkom za novu narudžbu.
        {!user.remindersEnabled ? (
          <>
            {" "}
            Podsjetnici su trenutno isključeni, uključite ih u <Link href="/racun">postavkama računa</Link>.
          </>
        ) : null}
      </p>

      {favorites.length === 0 ? (
        <div className="card p-8 text-center sm:p-12">
          <h2 className="text-2xl">Još nemate omiljenih proizvoda</h2>
          <p className="mx-auto mb-6 mt-2 max-w-md text-ink-soft">Kliknite na srce na proizvodu da ga sačuvate ovdje.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pas" className="btn btn-primary">Hrana za pse</Link>
            <Link href="/macka" className="btn btn-primary">Hrana za mačke</Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-5">
          {favorites.map((f) => {
            const p = getProduct(f.productSlug);
            if (!p) return null;
            const last = lastOrders.get(p.slug);
            const weeks = f.intervalWeeks ?? p.intervalWeeks;
            const nextReminder = last ? new Date(new Date(last).getTime() + weeks * 7 * DAY - site.reminderLeadDays * DAY) : null;
            return (
              <li key={p.slug} className="card grid gap-5 p-5 md:grid-cols-[9rem_1fr_auto] md:items-start">
                <ProductArt pack={p.pack} tone={p.tone} pet={p.pet} image={p.image} className="h-36 w-36 rounded-2xl" />
                <div className="min-w-0">
                  <h2 className="text-lg leading-snug">
                    <Link href={productUrl(p)} className="text-ink">{p.name}</Link>
                  </h2>
                  {last ? <p className="mt-1 text-sm text-ink-soft">Zadnja narudžba: {formatDate(last)}</p> : null}

                  <form action={setRegularAction} className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-3">
                    <input type="hidden" name="slug" value={p.slug} />
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold">
                      <input type="checkbox" name="regular" defaultChecked={f.regular} className="h-5 w-5 accent-teal" />
                      Uzimam redovno
                    </label>
                    <div>
                      <label htmlFor={`interval-${p.slug}`} className="mb-1 block text-sm font-semibold">Podsjeti me svakih</label>
                      <select id={`interval-${p.slug}`} name="interval" defaultValue={String(weeks)} className="field !min-h-11 !w-auto">
                        {INTERVAL_OPTIONS.map((w) => (
                          <option key={w} value={w}>{w} sedmica</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-outline btn-sm">Sačuvaj</button>
                  </form>
                  {f.regular && nextReminder ? (
                    <p className="mt-3 text-sm text-ink-soft">Sljedeći podsjetnik oko {formatDate(nextReminder.toISOString())}.</p>
                  ) : f.regular ? (
                    <p className="mt-3 text-sm text-ink-soft">Podsjetnik počinje nakon prve narudžbe ovog proizvoda.</p>
                  ) : null}
                </div>
                <div className="md:w-72">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">Ukloni iz omiljenih</span>
                    <HeartButton slug={p.slug} name={p.name} className="border border-line" />
                  </div>
                  <AddToCart slug={p.slug} name={p.name} variants={p.variants} compact />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
