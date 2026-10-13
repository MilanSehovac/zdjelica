import { CATEGORIES, PETS, type CategorySlug, type PackShape, type Pet } from "./catalog";
import type { ProductInput } from "./products";

export const PACK_OPTIONS: { value: PackShape; label: string }[] = [
  { value: "bag", label: "Vreća" },
  { value: "can", label: "Konzerva" },
  { value: "pouch", label: "Vrećica" },
  { value: "box", label: "Kutija" },
  { value: "bottle", label: "Bočica" },
  { value: "tube", label: "Tuba" },
  { value: "tub", label: "Kanta / posuda" },
];

export const TONE_OPTIONS = [
  { value: 0, label: "Zelena" },
  { value: 1, label: "Narandžasta" },
  { value: 2, label: "Plava" },
  { value: 3, label: "Ružičasta" },
] as const;

export type VariantRow = { id: string; label: string; price: string };

export type ParsedProduct =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: Record<string, string> };

/** "12,50" ili "12.5" → 1250 feninga. Vraća null ako unos nije ispravna cijena. */
export function parsePriceKM(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(Number(s) * 100);
  return cents > 0 ? cents : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};

export function parseProductForm(fd: FormData): ParsedProduct {
  const errors: Record<string, string> = {};

  const name = str(fd, "name");
  if (name.length < 3) errors.name = "Naziv mora imati najmanje 3 znaka.";
  else if (name.length > 120) errors.name = "Naziv može imati najviše 120 znakova.";

  const pet = str(fd, "pet");
  if (!(pet in PETS)) errors.pet = "Odaberite za koga je proizvod.";
  const category = str(fd, "category");
  if (!(category in CATEGORIES)) errors.category = "Odaberite kategoriju.";
  const pack = str(fd, "pack");
  if (!PACK_OPTIONS.some((p) => p.value === pack)) errors.pack = "Odaberite oblik ilustracije.";
  const tone = Number(str(fd, "tone"));
  if (![0, 1, 2, 3].includes(tone)) errors.tone = "Odaberite boju.";

  const short = str(fd, "short");
  if (short.length < 5) errors.short = "Kratki opis mora imati najmanje 5 znakova.";
  else if (short.length > 160) errors.short = "Kratki opis može imati najviše 160 znakova.";

  const description = str(fd, "description")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (description.length === 0) errors.description = "Unesite opis proizvoda.";
  else if (description.length > 6) errors.description = "Najviše 6 pasusa.";
  else if (description.some((p) => p.length > 1200)) errors.description = "Pasus može imati najviše 1200 znakova.";

  const highlights = str(fd, "highlights")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (highlights.length > 6) errors.highlights = "Najviše 6 stavki.";
  else if (highlights.some((l) => l.length > 90)) errors.highlights = "Stavka može imati najviše 90 znakova.";

  const intervalWeeks = Number(str(fd, "intervalWeeks"));
  if (!Number.isInteger(intervalWeeks) || intervalWeeks < 1 || intervalWeeks > 26) {
    errors.intervalWeeks = "Unesite broj sedmica između 1 i 26.";
  }

  const ids = fd.getAll("variantId").map(String);
  const labels = fd.getAll("variantLabel").map((v) => String(v).trim());
  const prices = fd.getAll("variantPrice").map(String);
  const variants: ProductInput["variants"] = [];
  let variantError = "";
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const priceRaw = (prices[i] ?? "").trim();
    if (!label && !priceRaw) continue; // prazan red
    const cents = parsePriceKM(priceRaw);
    if (!label) variantError = "Svaka varijanta mora imati naziv (npr. 3 kg).";
    else if (label.length > 30) variantError = "Naziv varijante može imati najviše 30 znakova.";
    else if (cents === null) variantError = `Cijena za „${label}“ nije ispravna (npr. 14,90).`;
    else variants.push({ id: ids[i] || undefined, label, priceCents: cents });
    if (variantError) break;
  }
  if (!variantError && variants.length === 0) variantError = "Dodajte barem jednu varijantu s cijenom.";
  if (!variantError && variants.length > 8) variantError = "Najviše 8 varijanti.";
  if (!variantError && new Set(variants.map((v) => v.label.toLowerCase())).size !== variants.length) {
    variantError = "Nazivi varijanti moraju biti različiti.";
  }
  if (variantError) errors.variants = variantError;

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      pet: pet as Pet,
      category: category as CategorySlug,
      pack: pack as PackShape,
      tone: tone as 0 | 1 | 2 | 3,
      short,
      description,
      highlights,
      variants,
      intervalWeeks,
      featured: fd.get("featured") === "on",
      active: fd.get("active") === "on",
    },
  };
}
