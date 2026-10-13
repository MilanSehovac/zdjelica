import type { MetadataRoute } from "next";
import { CATEGORIES, PETS, categoryUrl, productUrl, type CategorySlug, type Pet } from "@/lib/catalog";
import { listProducts } from "@/lib/products";
import { guides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/vodici"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  for (const pet of Object.keys(PETS) as Pet[]) {
    entries.push({ url: absoluteUrl(categoryUrl(pet)), lastModified: now, changeFrequency: "weekly", priority: 0.9 });
    for (const cat of Object.keys(CATEGORIES) as CategorySlug[]) {
      entries.push({ url: absoluteUrl(categoryUrl(pet, cat)), lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    }
  }
  for (const p of listProducts()) {
    entries.push({ url: absoluteUrl(productUrl(p)), lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  }
  for (const g of guides) {
    entries.push({ url: absoluteUrl(`/vodici/${g.slug}`), lastModified: new Date(`${g.published}T12:00:00Z`), changeFrequency: "monthly", priority: 0.5 });
  }
  for (const path of ["/dostava-i-placanje", "/povrat-i-reklamacije", "/kontakt", "/uslovi-koristenja", "/politika-privatnosti"]) {
    entries.push({ url: absoluteUrl(path), lastModified: now, changeFrequency: "yearly", priority: 0.3 });
  }
  return entries;
}
