import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { getProduct } from "@/lib/products";
import { getGuide, guides } from "@/lib/guides";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return pageMetadata({
    title: g.title,
    description: g.description,
    path: `/vodici/${g.slug}`,
    type: "article",
    publishedTime: `${g.published}T12:00:00+02:00`,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const related = g.related.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const others = guides.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[{ name: "Vodiči", href: "/vodici" }, { name: g.title }]} />
      <article className="prose-page pb-6 pt-4">
        <h1 className="text-[clamp(1.9rem,3.2vw+0.6rem,3rem)]">{g.title}</h1>
        <p className="mt-3 text-sm font-semibold text-ink-soft">
          {formatDate(`${g.published}T12:00:00Z`)}, {g.readMinutes} min čitanja
        </p>
        <p className="mt-5 text-lg">{g.intro}</p>

        {g.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl">{s.heading}</h2>
            {s.paragraphs?.map((t) => <p key={t}>{t}</p>)}
            {s.list ? (s.ordered ? <ol>{s.list.map((i) => <li key={i}>{i}</li>)}</ol> : <ul>{s.list.map((i) => <li key={i}>{i}</li>)}</ul>) : null}
          </section>
        ))}
      </article>

      {related.length > 0 ? (
        <section className="container-page mt-10" aria-labelledby="rel-products">
          <h2 id="rel-products" className="mb-5 text-2xl">Proizvodi o kojima je riječ</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      ) : null}

      <nav className="container-page mt-14" aria-labelledby="more-guides">
        <h2 id="more-guides" className="mb-4 text-2xl">Pročitajte i</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="card p-5">
              <Link href={`/vodici/${o.slug}`} className="font-display text-lg font-bold">{o.title}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          datePublished: `${g.published}T12:00:00+02:00`,
          dateModified: `${g.published}T12:00:00+02:00`,
          inLanguage: "bs",
          mainEntityOfPage: absoluteUrl(`/vodici/${g.slug}`),
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
        }}
      />
    </>
  );
}
