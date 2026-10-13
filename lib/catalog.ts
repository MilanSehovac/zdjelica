/**
 * Tipovi, kategorije i SEO tekstovi kataloga (bez pristupa bazi, pa se smije
 * uvoziti i u klijentske komponente). Proizvodi se čuvaju u bazi i uređuju kroz
 * admin dashboard; čitanje je u lib/products.ts. Cijene su u feninzima (1 KM = 100).
 */

export type Pet = "pas" | "macka";
export type CategorySlug = "suha-hrana" | "mokra-hrana" | "poslastice" | "higijena";
export type PackShape = "bag" | "can" | "pouch" | "box" | "bottle" | "tube" | "tub";

export type Variant = {
  id: string;
  label: string;
  priceCents: number;
};

export type Product = {
  slug: string;
  name: string;
  pet: Pet;
  category: CategorySlug;
  pack: PackShape;
  /** 0-3: odabir boje pakovanja u ilustraciji. */
  tone: 0 | 1 | 2 | 3;
  short: string;
  description: string[];
  highlights: string[];
  variants: Variant[];
  /** Okvirno za koliko sedmica se potroši jedan paket (predlaže razmak za redovnu narudžbu). */
  intervalWeeks: number;
  featured?: boolean;
  /** Ime fajla učitane fotografije (servira se sa /media/...). Bez nje se prikazuje ilustracija pakovanja. */
  image?: string | null;
  /** Neaktivni proizvodi se ne prikazuju i ne mogu se naručiti. */
  active?: boolean;
};

export const PETS: Record<Pet, { slug: Pet; label: string; plural: string; genitive: string }> = {
  pas: { slug: "pas", label: "Pas", plural: "Psi", genitive: "pse" },
  macka: { slug: "macka", label: "Mačka", plural: "Mačke", genitive: "mačke" },
};

export const CATEGORIES: Record<CategorySlug, { slug: CategorySlug; label: string; singular: string }> = {
  "suha-hrana": { slug: "suha-hrana", label: "Suha hrana", singular: "suha hrana" },
  "mokra-hrana": { slug: "mokra-hrana", label: "Mokra hrana", singular: "mokra hrana" },
  poslastice: { slug: "poslastice", label: "Poslastice", singular: "poslastice" },
  higijena: { slug: "higijena", label: "Higijena i njega", singular: "higijena i njega" },
};

/** SEO tekstovi za svaku kombinaciju ljubimac + kategorija (svaka stranica ima jedinstven sadržaj). */
export const LANDING: Record<
  Pet,
  { title: string; description: string; intro: string[]; categories: Record<CategorySlug, { title: string; description: string; intro: string[] }> }
> = {
  pas: {
    title: "Hrana i potrepštine za pse",
    description:
      "Suha i mokra hrana, poslastice i higijena za pse. Plaćanje pouzećem, dostava širom BiH i podsjetnik kad je vrijeme za novu vreću.",
    intro: [
      "Pas se hrani svaki dan, pa je najpraktičnije da hrana dolazi po rasporedu, a ne kad nam već ponestane. Ovdje možete odabrati hranu, sačuvati je u omiljene i označiti da je uzimate redovno.",
      "Sve narudžbe plaćate pouzećem, a dostava ide na kućnu adresu u cijeloj Bosni i Hercegovini.",
    ],
    categories: {
      "suha-hrana": {
        title: "Suha hrana za pse",
        description:
          "Suha hrana za štence i odrasle pse u pakovanjima od 3 i 12 kg. Dostava pouzećem širom BiH.",
        intro: [
          "Suha hrana je najčešći izbor za svakodnevnu ishranu pasa jer se lako odmjerava i dugo traje. Za štence birajte hranu označenu za štenad, a za odrasle pse onu za odrasle.",
          "Velika pakovanja su povoljnija po kilogramu, a ako ih uzimate redovno, označite ih kao omiljene i podesite razmak narudžbe.",
        ],
      },
      "mokra-hrana": {
        title: "Mokra hrana za pse",
        description:
          "Konzerve i vrećice mokre hrane za pse. Možete kombinovati sa suhom hranom ili davati kao posebne obroke.",
        intro: [
          "Mokra hrana ima više vlage i izražen miris, pa je često omiljena kod probirljivih pasa. Mnogi je miješaju sa suhom hranom ili je daju kao dopunu.",
          "Kutije od 6 i 12 komada su praktične za ponovne narudžbe.",
        ],
      },
      poslastice: {
        title: "Poslastice za pse",
        description:
          "Poslastice i dentalni štapići za pse. Idealne za dresuru i nagrađivanje.",
        intro: [
          "Poslastice služe za nagrađivanje i dresuru. Pazite da zajedno ne pređu manji dio dnevnog unosa hrane, a posebno ih računajte kod pasa koji su skloni debljanju.",
        ],
      },
      higijena: {
        title: "Higijena i njega pasa",
        description:
          "Vrećice za otpad i šamponi za pse. Potrošni artikli koje je najlakše naručivati redovno.",
        intro: [
          "Vrećice za otpad troše se svakodnevno, pa ih se isplati uzeti u većem pakovanju. Šampon birajte blag i koristite ga rijetko, prema preporuci veterinara.",
        ],
      },
    },
  },
  macka: {
    title: "Hrana i potrepštine za mačke",
    description:
      "Suha i mokra hrana, poslastice i pijesak za mačke. Plaćanje pouzećem, dostava širom BiH i podsjetnik za obnovu zaliha.",
    intro: [
      "Mačke vole rutinu, a hrana i pijesak su stvari koje se troše ravnomjerno. Zato je najlakše podesiti redovnu narudžbu i dobiti podsjetnik prije nego zalihe nestanu.",
      "Plaćanje je pouzećem, a dostava ide na kućnu adresu u cijeloj BiH.",
    ],
    categories: {
      "suha-hrana": {
        title: "Suha hrana za mačke",
        description:
          "Suha hrana za odrasle i sterilisane mačke u pakovanjima od 2 i 7 kg. Dostava pouzećem širom BiH.",
        intro: [
          "Suha hrana je praktična jer se ne kvari u zdjelici i lako se odmjerava. Sterilisane mačke često trebaju hranu prilagođenu manjoj potrošnji energije, pa pročitajte oznaku na pakovanju.",
          "Mačka treba uvijek imati pristup svježoj vodi, posebno kad jede suhu hranu.",
        ],
      },
      "mokra-hrana": {
        title: "Mokra hrana za mačke",
        description:
          "Vrećice mokre hrane za mačke u kutijama od 12 i 24 komada. Dostava pouzećem širom BiH.",
        intro: [
          "Mokra hrana pomaže da mačka unese više tečnosti, što je korisno jer mačke često piju malo vode. Vrećice se otvaraju lako i nema viška za bacanje.",
        ],
      },
      poslastice: {
        title: "Poslastice za mačke",
        description:
          "Kremaste poslastice za mačke. Praktične za nagrađivanje i za davanje lijekova uz hranu.",
        intro: [
          "Kremaste poslastice mačke obično rado prihvataju. Daju se kao nagrada, a računaju se kao dio dnevnog unosa hrane.",
        ],
      },
      higijena: {
        title: "Pijesak za mačke",
        description:
          "Grudvajući i silikatni pijesak za mačke u pakovanjima od 5 do 20 litara. Dostava pouzećem širom BiH.",
        intro: [
          "Pijesak je potrošni artikal koji se mijenja redovno, pa ga je najlakše naručiti unaprijed. Grudvajući se uklanja ciljano, dok silikatni dobro upija i ima manje prašine.",
          "Teška pakovanja nosi kurir, a ne vi.",
        ],
      },
    },
  },
};


// ───────────── Pomoćne funkcije ─────────────

export function isPet(value: string): value is Pet {
  return value === "pas" || value === "macka";
}

export function isCategory(value: string): value is CategorySlug {
  return value in CATEGORIES;
}

export function minPrice(p: Product): number {
  return Math.min(...p.variants.map((v) => v.priceCents));
}

export function productUrl(p: Pick<Product, "slug">) {
  return `/proizvod/${p.slug}`;
}

export function categoryUrl(pet: Pet, category?: CategorySlug) {
  return category ? `/${pet}/${category}` : `/${pet}`;
}

export function makeSku(slug: string, variantId: string) {
  return `${slug}:${variantId}`;
}

/** Minimalan indeks varijanti koji se šalje klijentu (korpa i checkout). */
export type SkuInfo = {
  sku: string;
  slug: string;
  name: string;
  variant: string;
  priceCents: number;
  pack: PackShape;
  tone: 0 | 1 | 2 | 3;
  pet: Pet;
  image: string | null;
};

