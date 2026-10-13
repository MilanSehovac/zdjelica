import { getDb, nowIso } from "./db";
import {
  makeSku,
  type CategorySlug,
  type PackShape,
  type Pet,
  type Product,
  type SkuInfo,
  type Variant,
} from "./catalog";

type Row = {
  slug: string;
  name: string;
  pet: Pet;
  category: CategorySlug;
  pack: PackShape;
  tone: number;
  short: string;
  description: string;
  highlights: string;
  variants: string;
  interval_weeks: number;
  featured: number;
  active: number;
  image: string | null;
};

function toProduct(r: Row): Product {
  return {
    slug: r.slug,
    name: r.name,
    pet: r.pet,
    category: r.category,
    pack: r.pack,
    tone: (r.tone >= 0 && r.tone <= 3 ? r.tone : 0) as Product["tone"],
    short: r.short,
    description: JSON.parse(r.description) as string[],
    highlights: JSON.parse(r.highlights) as string[],
    variants: JSON.parse(r.variants) as Variant[],
    intervalWeeks: r.interval_weeks,
    featured: r.featured === 1,
    image: r.image,
    active: r.active === 1,
  };
}

// ───────────── Čitanje (javni dio shopa: samo aktivni proizvodi) ─────────────

export function getProduct(slug: string): Product | undefined {
  const r = getDb().prepare("SELECT * FROM products WHERE slug = ? AND active = 1").get(slug) as Row | undefined;
  return r ? toProduct(r) : undefined;
}

export function listProducts(): Product[] {
  return (getDb().prepare("SELECT * FROM products WHERE active = 1 ORDER BY rowid").all() as Row[]).map(toProduct);
}

export function getProducts(filter: { pet?: Pet; category?: CategorySlug } = {}): Product[] {
  return listProducts().filter(
    (p) => (!filter.pet || p.pet === filter.pet) && (!filter.category || p.category === filter.category),
  );
}

export function relatedProducts(p: Product, limit = 4): Product[] {
  const all = listProducts().filter((x) => x.slug !== p.slug && x.pet === p.pet);
  return [...all.filter((x) => x.category === p.category), ...all.filter((x) => x.category !== p.category)].slice(0, limit);
}

export function parseSku(sku: string): { product: Product; variant: Variant } | null {
  const [slug, variantId] = sku.split(":");
  if (!slug || !variantId) return null;
  const product = getProduct(slug);
  const variant = product?.variants.find((v) => v.id === variantId);
  return product && variant ? { product, variant } : null;
}

/** Minimalan indeks varijanti koji se šalje klijentu (korpa i checkout). */
export function buildSkuIndex(): Record<string, SkuInfo> {
  const index: Record<string, SkuInfo> = {};
  for (const p of listProducts()) {
    for (const v of p.variants) {
      const sku = makeSku(p.slug, v.id);
      index[sku] = {
        sku, slug: p.slug, name: p.name, variant: v.label, priceCents: v.priceCents,
        pack: p.pack, tone: p.tone, pet: p.pet, image: p.image ?? null,
      };
    }
  }
  return index;
}

// ───────────── Admin ─────────────

/** Svi proizvodi, uključujući neaktivne. */
export function listAllProducts(): Product[] {
  return (getDb().prepare("SELECT * FROM products ORDER BY rowid").all() as Row[]).map(toProduct);
}

export function getProductAny(slug: string): Product | undefined {
  const r = getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as Row | undefined;
  return r ? toProduct(r) : undefined;
}

const MAP: Record<string, string> = { č: "c", ć: "c", š: "s", ž: "z", đ: "dj" };

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[čćšžđ]/g, (c) => MAP[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function uniqueSlug(name: string): string {
  const db = getDb();
  const base = slugify(name) || "proizvod";
  let slug = base;
  // "novi" je rezervisano za adresu /admin/proizvodi/novi.
  for (let i = 2; slug === "novi" || db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export type ProductInput = {
  name: string;
  pet: Pet;
  category: CategorySlug;
  pack: PackShape;
  tone: 0 | 1 | 2 | 3;
  short: string;
  description: string[];
  highlights: string[];
  variants: { id?: string; label: string; priceCents: number }[];
  intervalWeeks: number;
  featured: boolean;
  active: boolean;
};

/** Varijante dobijaju stabilne ID-eve (dio šifre u korpi), pa se postojeći ID nikad ne mijenja. */
function normalizeVariants(input: ProductInput["variants"]): Variant[] {
  const used = new Set<string>();
  const out: Variant[] = [];
  for (const v of input) {
    let id = v.id && /^[a-z0-9-]{1,40}$/.test(v.id) ? v.id : slugify(v.label) || "v";
    if (!v.id) for (let i = 2; used.has(id); i++) id = `${slugify(v.label) || "v"}-${i}`;
    if (used.has(id)) continue;
    used.add(id);
    out.push({ id, label: v.label, priceCents: v.priceCents });
  }
  return out;
}

export function createProduct(input: ProductInput, image: string | null): Product {
  const slug = uniqueSlug(input.name);
  const now = nowIso();
  getDb()
    .prepare(
      `INSERT INTO products
       (slug, name, pet, category, pack, tone, short, description, highlights, variants, interval_weeks, featured, active, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      slug, input.name, input.pet, input.category, input.pack, input.tone, input.short,
      JSON.stringify(input.description), JSON.stringify(input.highlights), JSON.stringify(normalizeVariants(input.variants)),
      input.intervalWeeks, input.featured ? 1 : 0, input.active ? 1 : 0, image, now, now,
    );
  return getProductAny(slug)!;
}

/** `image`: undefined = ne diraj, null = ukloni, string = nova fotografija. */
export function updateProduct(slug: string, input: ProductInput, image?: string | null): Product | null {
  const current = getProductAny(slug);
  if (!current) return null;
  getDb()
    .prepare(
      `UPDATE products SET name = ?, pet = ?, category = ?, pack = ?, tone = ?, short = ?, description = ?, highlights = ?,
       variants = ?, interval_weeks = ?, featured = ?, active = ?, image = ?, updated_at = ? WHERE slug = ?`,
    )
    .run(
      input.name, input.pet, input.category, input.pack, input.tone, input.short,
      JSON.stringify(input.description), JSON.stringify(input.highlights), JSON.stringify(normalizeVariants(input.variants)),
      input.intervalWeeks, input.featured ? 1 : 0, input.active ? 1 : 0,
      image === undefined ? current.image ?? null : image, nowIso(), slug,
    );
  return getProductAny(slug)!;
}

export function setProductActive(slug: string, active: boolean) {
  getDb().prepare("UPDATE products SET active = ?, updated_at = ? WHERE slug = ?").run(active ? 1 : 0, nowIso(), slug);
}

/** Briše proizvod i njegove omiljene unose. Stare narudžbe ostaju (čuvaju vlastiti snimak naziva i cijene). Vraća ime fotografije za brisanje. */
export function deleteProduct(slug: string): { image: string | null } | null {
  const current = getProductAny(slug);
  if (!current) return null;
  const db = getDb();
  db.prepare("DELETE FROM favorites WHERE product_slug = ?").run(slug);
  db.prepare("DELETE FROM products WHERE slug = ?").run(slug);
  return { image: current.image ?? null };
}
