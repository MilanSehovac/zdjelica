import { getDb, nowIso } from "./db";
import { getProduct } from "./products";

export type Favorite = {
  productSlug: string;
  regular: boolean;
  intervalWeeks: number | null;
  createdAt: string;
};

type Row = { product_slug: string; regular: number; interval_weeks: number | null; created_at: string };

export const INTERVAL_OPTIONS = [2, 3, 4, 6, 8, 12] as const;

export function listFavorites(userId: number): Favorite[] {
  const rows = getDb()
    .prepare("SELECT product_slug, regular, interval_weeks, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Row[];
  return rows
    .filter((r) => getProduct(r.product_slug)) // proizvod je možda uklonjen iz kataloga
    .map((r) => ({
      productSlug: r.product_slug,
      regular: r.regular === 1,
      intervalWeeks: r.interval_weeks,
      createdAt: r.created_at,
    }));
}

/** Dodaje ili uklanja proizvod iz omiljenih. Vraća novo stanje. */
export function toggleFavorite(userId: number, slug: string): boolean {
  if (!getProduct(slug)) throw new Error("UNKNOWN_PRODUCT");
  const db = getDb();
  const existing = db.prepare("SELECT 1 FROM favorites WHERE user_id = ? AND product_slug = ?").get(userId, slug);
  if (existing) {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND product_slug = ?").run(userId, slug);
    return false;
  }
  db.prepare("INSERT INTO favorites (user_id, product_slug, created_at) VALUES (?, ?, ?)").run(userId, slug, nowIso());
  return true;
}

/** Označava da korisnik proizvod uzima redovno i na koliko sedmica. */
export function setRegular(userId: number, slug: string, regular: boolean, intervalWeeks?: number) {
  const product = getProduct(slug);
  if (!product) throw new Error("UNKNOWN_PRODUCT");
  const weeks = regular ? clampInterval(intervalWeeks ?? product.intervalWeeks) : null;
  const db = getDb();
  db.prepare(
    `INSERT INTO favorites (user_id, product_slug, regular, interval_weeks, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, product_slug) DO UPDATE SET regular = excluded.regular, interval_weeks = excluded.interval_weeks`,
  ).run(userId, slug, regular ? 1 : 0, weeks, nowIso());
}

function clampInterval(weeks: number) {
  if (!Number.isFinite(weeks)) return 4;
  return Math.min(26, Math.max(1, Math.round(weeks)));
}
