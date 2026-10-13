import type { Metadata } from "next";
import { site } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Privatne stranice (korpa, račun...) ne idu u pretragu. */
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
};

export function pageMetadata({ title, description, path, noindex, type = "website", publishedTime }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      siteName: site.name,
      locale: site.locale,
      title: `${title} | ${site.name}`,
      description,
      url: path,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}
