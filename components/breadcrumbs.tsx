import Link from "next/link";
import { JsonLd } from "./json-ld";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { name: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "Početna", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Putanja" className="container-page pt-5 text-[0.95rem] text-ink-soft">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.name} className="flex items-center gap-2">
                {last || !c.href ? (
                  <span aria-current={last ? "page" : undefined} className="font-semibold text-ink">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="inline-block py-2 text-ink-soft">
                    {c.name}
                  </Link>
                )}
                {!last && (
                  <svg viewBox="0 0 8 12" className="h-3 w-2 text-ink-soft" aria-hidden="true">
                    <path d="M1.5 1.5 6 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            ...(c.href ? { item: absoluteUrl(c.href) } : {}),
          })),
        }}
      />
    </>
  );
}
