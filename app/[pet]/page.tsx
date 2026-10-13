import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, LANDING, PETS, categoryUrl, isPet, type CategorySlug, type Pet } from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(PETS) as Pet[]).map((pet) => ({ pet }));
}

export async function generateMetadata({ params }: { params: Promise<{ pet: string }> }): Promise<Metadata> {
  const { pet } = await params;
  if (!isPet(pet)) return {};
  return pageMetadata({ title: LANDING[pet].title, description: LANDING[pet].description, path: categoryUrl(pet) });
}

export default async function PetPage({ params }: { params: Promise<{ pet: string }> }) {
  const { pet } = await params;
  if (!isPet(pet)) notFound();
  const page = LANDING[pet];
  const cats = Object.keys(CATEGORIES) as CategorySlug[];

  return (
    <>
      <Breadcrumbs items={[{ name: PETS[pet].plural }]} />
      <div className="container-page pb-4 pt-4">
        <h1 className="max-w-3xl">{page.title}</h1>
        <div className="mt-4 max-w-2xl space-y-3 text-ink-soft">
          {page.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <li key={c}>
              <Link href={categoryUrl(pet, c)} className="btn btn-outline btn-sm">
                {LANDING[pet].categories[c].title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {cats.map((c) => {
        const items = getProducts({ pet, category: c });
        if (items.length === 0) return null;
        return (
          <section key={c} className="container-page mt-12" aria-labelledby={`cat-${c}`}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <h2 id={`cat-${c}`}>{page.categories[c].title}</h2>
              <Link href={categoryUrl(pet, c)} className="font-semibold">Pogledaj sve</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
