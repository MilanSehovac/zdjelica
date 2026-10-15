import fs from "node:fs";
import path from "node:path";
import { SEED_PRODUCTS } from "./seed-products";

type SqliteModule = typeof import("node:sqlite");
export type Db = InstanceType<SqliteModule["DatabaseSync"]>;

/**
 * Koristimo ugrađeni `node:sqlite` (Node 22.13+), pa nema native zavisnosti
 * koje bi pravile probleme pri instalaciji na Windowsu.
 * `process.getBuiltinModule` zaobilazi bundler.
 */
function loadSqlite(): SqliteModule {
  const mod = process.getBuiltinModule("node:sqlite") as SqliteModule | undefined;
  if (!mod) throw new Error("node:sqlite nije dostupan. Potreban je Node.js 22.13 ili noviji.");
  return mod;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  regular INTEGER NOT NULL DEFAULT 0,
  interval_weeks INTEGER,
  last_reminded_at TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, product_slug)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pet TEXT NOT NULL,
  category TEXT NOT NULL,
  pack TEXT NOT NULL,
  tone INTEGER NOT NULL DEFAULT 0,
  short TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT NOT NULL,
  variants TEXT NOT NULL,
  interval_weeks INTEGER NOT NULL DEFAULT 4,
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

function migrate(db: Db) {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "is_admin")) {
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
  }
  // Kategorija "suha-hrana" je preimenovana u "suva-hrana"; prebacujemo postojeće proizvode.
  db.exec("UPDATE products SET category = 'suva-hrana' WHERE category = 'suha-hrana'");
  seedCatalog(db);
}

/**
 * Pri prvom pokretanju upisuje DEMO proizvode, da shop nije prazan.
 * Oznaka u tabeli `meta` sprječava ponovno dodavanje nakon što ih admin obriše.
 */
function seedCatalog(db: Db) {
  if (db.prepare("SELECT 1 FROM meta WHERE key = 'catalog_seeded'").get()) return;
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT 1 FROM meta WHERE key = 'catalog_seeded'").get()) {
      const insert = db.prepare(
        `INSERT OR IGNORE INTO products
         (slug, name, pet, category, pack, tone, short, description, highlights, variants, interval_weeks, featured, active, image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, ?, ?)`,
      );
      const now = new Date().toISOString();
      for (const p of SEED_PRODUCTS) {
        insert.run(
          p.slug, p.name, p.pet, p.category, p.pack, p.tone, p.short,
          JSON.stringify(p.description), JSON.stringify(p.highlights), JSON.stringify(p.variants),
          p.intervalWeeks, p.featured ? 1 : 0, now, now,
        );
      }
      db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('catalog_seeded', ?)").run(now);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

const globalForDb = globalThis as unknown as { __zdjelicaDb?: Db; __zdjelicaDbPath?: string };

export function dbPath(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "zdjelica.db");
}

export function getDb(): Db {
  const file = dbPath();
  if (globalForDb.__zdjelicaDb && globalForDb.__zdjelicaDbPath === file) return globalForDb.__zdjelicaDb;

  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const { DatabaseSync } = loadSqlite();
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec(SCHEMA);
  migrate(db);

  globalForDb.__zdjelicaDb = db;
  globalForDb.__zdjelicaDbPath = file;
  return db;
}

/** Izvršava funkciju u transakciji; greška poništava sve izmjene. */
export function transaction<T>(fn: (db: Db) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function nowIso() {
  return new Date().toISOString();
}
