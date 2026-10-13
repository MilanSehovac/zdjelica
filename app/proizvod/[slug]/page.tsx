import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AddToCart } from "@/components/add-to-cart";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeartButton } from "@/components/heart-button";
import { JsonLd } from "@/components/json-ld";
import { ProductArt } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import {
  CATEGORIES,
  LANDING,
  PETS,
  categoryUrl,
  minPrice,
  productUrl,
} from "@/lib/catalog";
import { getProduct, listProducts, relatedProducts } from "@/lib/products";
import { formatKM, toDecimal } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const base = pageMetadata({
    title: p.name,
    description: `${p.short} Cijena od ${formatKM(minPrice(p))}. Plaćanje pouzećem, dostava širom BiH.`,
    path: productUrl(p),
  });
  const image = { url: `/slike/${p.slug}`, width: 1200, height: 630, alt: p.name };
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "website", images: [image] },
    twitter: { ...base.twitter, images: [image.url] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const related = relatedProducts(p);
  const categoryTitle = LANDING[p.pet].categories[p.category].title;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: PETS[p.pet].plural, href: categoryUrl(p.pet) },
          { name: categoryTitle, href: categoryUrl(p.pet, p.category) },
          { name: p.name },
        ]}
      />

      <div className="container-page grid gap-8 pb-4 pt-4 md:grid-cols-2 md:gap-12">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-line">
          <ProductArt pack={p.pack} tone={p.tone} pet={p.pet} image={p.image} title={p.name} priority className="aspect-square w-full" />
        </div>

        <div>
          <h1 className="text-[clamp(1.75rem,3vw+0.6rem,2.7rem)]">{p.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{p.short}</p>
          <p className="mt-4 text-2xl font-bold">
            {p.variants.length > 1 ? "od " : ""}
            {formatKM(minPrice(p))}
          </p>

          <div className="mt-6">
            <AddToCart slug={p.slug} name={p.name} variants={p.variants} />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-mint-soft p-4">
            <HeartButton slug={p.slug} name={p.name} className="shrink-0 border border-line" />
            <p className="text-[0.97rem]">
              Ovo pakovanje obično traje oko {p.intervalWeeks} sedmica. Sačuvajte ga u omiljene i označite kao redovno, pa ćemo vas podsjetiti na vrijeme.
            </p>
          </div>

          <ul className="mt-6 space-y-1.5 text-[0.97rem] text-ink-soft">
            <li>Plaćanje pouzećem pri preuzimanju</li>
            <li>Dostava {site.shipping.estimate}</li>
            <li>Besplatna dostava za narudžbe od {formatKM(site.shipping.freeOverCents)}</li>
          </ul>
        </div>
      </div>

      <div className="container-page mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="desc-title">
          <h2 id="desc-title" className="mb-3 text-2xl">O proizvodu</h2>
          <div className="max-w-prose space-y-3 text-ink">
            {p.description.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>
        <section aria-labelledby="highlights-title" className="card h-fit p-6">
          <h2 id="highlights-title" className="mb-3 text-2xl">Ukratko</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            Više o ishrani u našim <Link href="/vodici">vodičima</Link>.
          </p>
        </section>
      </div>

      <section className="container-page mt-16" aria-labelledby="related-title">
        <h2 id="related-title" className="mb-5">Možda vam treba i ovo</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {related.map((r) => (
            <ProductCard key={r.slug} product={r} />
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.description.join(" "),
          image: absoluteUrl(`/slike/${p.slug}`),
          category: `${PETS[p.pet].plural} > ${CATEGORIES[p.category].label}`,
          sku: `${p.slug}:${p.variants[0].id}`,
          url: absoluteUrl(productUrl(p)),
          offers: p.variants.map((v) => ({
            "@type": "Offer",
            name: `${p.name}, ${v.label}`,
            sku: `${p.slug}:${v.id}`,
            url: absoluteUrl(productUrl(p)),
            price: toDecimal(v.priceCents),
            priceCurrency: site.currency,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          })),
        }}
      />
    </>
  );
}
