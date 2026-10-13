import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { guides } from "@/lib/guides";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Vodiči za vlasnike pasa i mačaka",
  description: "Praktični vodiči o ishrani pasa i mačaka: prelazak na novu hranu, količine, suha ili mokra hrana i izbor pijeska.",
  path: "/vodici",
});

export default function GuidesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Vodiči" }]} />
      <div className="container-page pb-4 pt-4">
        <h1 className="max-w-3xl">Vodiči za vlasnike pasa i mačaka</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Kratki, praktični tekstovi o ishrani i svakodnevnoj brizi. Za zdravstvena pitanja uvijek se obratite veterinaru.
        </p>
      </div>
      <div className="container-page mt-8 grid gap-5 md:grid-cols-2">
        {guides.map((g) => (
          <article key={g.slug} className="card relative p-6 transition-colors hover:border-teal">
            <h2 className="text-2xl">
              <Link href={`/vodici/${g.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:content-['']">
                {g.title}
              </Link>
            </h2>
            <p className="mt-2 text-ink-soft">{g.description}</p>
            <p className="mt-3 text-sm font-semibold text-teal">
              {formatDate(`${g.published}T12:00:00Z`)}, {g.readMinutes} min čitanja
            </p>
          </article>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Vodiči za vlasnike pasa i mačaka",
          url: absoluteUrl("/vodici"),
          inLanguage: "bs",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/vodici/${g.slug}`), name: g.title })),
          },
        }}
      />
    </>
  );
}
