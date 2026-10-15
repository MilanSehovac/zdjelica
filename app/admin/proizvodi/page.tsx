import Link from "next/link";
import { ProductArt } from "@/components/product-art";
import { CATEGORIES, PETS, productUrl } from "@/lib/catalog";
import { listAllProducts } from "@/lib/products";
import { formatKM } from "@/lib/money";
import { requireAdmin } from "@/lib/session";
import { deleteProductAction, toggleProductActiveAction } from "@/app/actions/products";

export const metadata = { title: "Proizvodi (admin)", robots: { index: false, follow: false } };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sacuvano?: string; obrisano?: string }>;
}) {
  await requireAdmin();
  const { sacuvano, obrisano } = await searchParams;
  const products = listAllProducts();

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Proizvodi</h1>
          <p className="mt-2 text-ink-soft">{products.length} ukupno. Izmjene su odmah vidljive u shopu.</p>
        </div>
        <Link href="/admin/proizvodi/novi" className="btn btn-primary">Dodaj proizvod</Link>
      </div>

      {sacuvano ? (
        <p role="status" className="mt-6 rounded-xl border-2 border-teal bg-white px-4 py-3 font-semibold text-teal">Proizvod je sačuvan.</p>
      ) : null}
      {obrisano ? (
        <p role="status" className="mt-6 rounded-xl border-2 border-teal bg-white px-4 py-3 font-semibold text-teal">Proizvod je obrisan.</p>
      ) : null}

      <ul className="mt-8 space-y-3">
        {products.map((p) => {
          const prices = p.variants.map((v) => v.priceCents);
          const range = Math.min(...prices) === Math.max(...prices) ? formatKM(prices[0]) : `${formatKM(Math.min(...prices))} – ${formatKM(Math.max(...prices))}`;
          return (
            <li key={p.slug} className="card flex flex-wrap items-center gap-4 p-4">
              <ProductArt pack={p.pack} tone={p.tone} pet={p.pet} image={p.image} className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 basis-60">
                <h2 className="text-base leading-snug">
                  <Link href={`/admin/proizvodi/${p.slug}`} className="text-ink">{p.name}</Link>
                </h2>
                <p className="text-sm text-ink-soft">
                  {PETS[p.pet]?.label ?? p.pet} · {CATEGORIES[p.category]?.label ?? p.category} · {p.variants.length} {p.variants.length === 1 ? "varijanta" : "varijante"}
                </p>
                <p className="mt-0.5 font-bold">{range}</p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 ${p.active ? "bg-mint text-teal-deep" : "bg-butter/50 text-ink"}`}>{p.active ? "Vidljiv" : "Sakriven"}</span>
                  {p.featured ? <span className="rounded-full bg-mint px-2.5 py-0.5 text-teal-deep">Na početnoj</span> : null}
                  {p.image ? null : <span className="rounded-full bg-line px-2.5 py-0.5 text-ink-soft">Bez fotografije</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/proizvodi/${p.slug}`} className="btn btn-dark btn-sm">Uredi</Link>
                {p.active ? <Link href={productUrl(p)} className="btn btn-outline btn-sm">Pogledaj</Link> : null}
                <form action={toggleProductActiveAction}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <button type="submit" className="btn btn-outline btn-sm">{p.active ? "Sakrij" : "Prikaži"}</button>
                </form>
                <details className="relative">
                  <summary className="btn btn-outline btn-sm cursor-pointer list-none text-coral">Obriši</summary>
                  <form action={deleteProductAction} className="absolute right-0 z-10 mt-2 w-64 rounded-xl border-2 border-coral bg-white p-3 shadow-lg">
                    <input type="hidden" name="slug" value={p.slug} />
                    <p className="mb-2 text-sm font-semibold">Trajno obrisati ovaj proizvod? Stare narudžbe ostaju.</p>
                    <button type="submit" className="btn btn-sm w-full bg-coral text-white">Da, obriši</button>
                  </form>
                </details>
              </div>
            </li>
          );
        })}
        {products.length === 0 ? <li className="card p-6 text-ink-soft">Nema proizvoda. Dodajte prvi.</li> : null}
      </ul>
    </div>
  );
}
