import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { JsonLd } from "@/components/json-ld";
import {
  CATEGORIES,
  LANDING,
  PETS,
  categoryUrl,
  isCategory,
  isPet,
  productUrl,
  type CategorySlug,
  type Pet,
} from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { pet: Pet; category: CategorySlug }[] = [];
  for (const pet of Object.keys(PETS) as Pet[]) {
    for (const category of Object.keys(CATEGORIES) as CategorySlug[]) out.push({ pet, category });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ pet: string; category: string }> }): Promise<Metadata> {
  const { pet, category } = await params;
  if (!isPet(pet) || !isCategory(category)) return {};
  const c = LANDING[pet].categories[category];
  return pageMetadata({ title: c.title, description: c.description, path: categoryUrl(pet, category) });
}

export default async function CategoryPage({ params }: { params: Promise<{ pet: string; category: string }> }) {
  const { pet, category } = await params;
  if (!isPet(pet) || !isCategory(category)) notFound();
  const page = LANDING[pet].categories[category];
  const items = getProducts({ pet, category });
  const others = (Object.keys(CATEGORIES) as CategorySlug[]).filter((c) => c !== category);

  return (
    <>
      <Breadcrumbs items={[{ name: PETS[pet].plural, href: categoryUrl(pet) }, { name: page.title }]} />
      <div className="container-page pb-4 pt-4">
        <h1 className="max-w-3xl">{page.title}</h1>
        <div className="mt-4 max-w-2xl space-y-3 text-ink-soft">
          {page.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </div>

      <section className="container-page mt-8" aria-label="Proizvodi">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} as="h2" />
          ))}
        </div>
      </section>

      <nav className="container-page mt-12" aria-label="Druge kategorije">
        <h2 className="mb-4 text-2xl">Pogledajte i</h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c}>
              <Link href={categoryUrl(pet, c)} className="btn btn-outline btn-sm">
                {LANDING[pet].categories[c].title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: page.title,
          description: page.description,
          url: absoluteUrl(categoryUrl(pet, category)),
          inLanguage: "bs",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: items.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(productUrl(p)),
              name: p.name,
            })),
          },
        }}
      />
    </>
  );
}
