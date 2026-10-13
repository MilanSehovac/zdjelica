import { getDb, nowIso } from "./db";

/** Vraća true ako je adresa nova, false ako je već prijavljena. */
export function subscribe(email: string, source: string): boolean {
  const result = getDb()
    .prepare("INSERT OR IGNORE INTO subscribers (email, source, created_at) VALUES (?, ?, ?)")
    .run(email.trim().toLowerCase(), source, nowIso());
  return Number(result.changes) > 0;
}

export function listSubscribers(): { email: string; source: string; createdAt: string }[] {
  const rows = getDb()
    .prepare("SELECT email, source, created_at FROM subscribers ORDER BY created_at DESC")
    .all() as { email: string; source: string; created_at: string }[];
  return rows.map((r) => ({ email: r.email, source: r.source, createdAt: r.created_at }));
}
