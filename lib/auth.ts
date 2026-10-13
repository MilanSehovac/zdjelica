import crypto from "node:crypto";
import { getDb, nowIso } from "./db";

export type User = {
  id: number;
  email: string;
  name: string;
  remindersEnabled: boolean;
  isAdmin: boolean;
  createdAt: string;
};

type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  reminders_enabled: number;
  is_admin: number;
  created_at: string;
};

const SESSION_DAYS = 30;

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    remindersEnabled: row.reminders_enabled === 1,
    isAdmin: row.is_admin === 1,
    createdAt: row.created_at,
  };
}

// ───────────── Lozinke (scrypt) ─────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(actual, expected);
}

// Fiktivni hash služi da vrijeme odgovora ne otkriva postoji li nalog.
const DUMMY_HASH = hashPassword("zdjelica-dummy-password");

// ───────────── Korisnici ─────────────

export class EmailTakenError extends Error {
  constructor() {
    super("EMAIL_TAKEN");
  }
}

export function createUser(input: { email: string; name: string; password: string }): User {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) throw new EmailTakenError();
  const result = db
    .prepare("INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(email, input.name.trim(), hashPassword(input.password), nowIso());
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(result.lastInsertRowid)) as UserRow;
  return toUser(row);
}

export function authenticate(emailInput: string, password: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(emailInput.trim().toLowerCase()) as
    | UserRow
    | undefined;
  if (!row) {
    verifyPassword(password, DUMMY_HASH);
    return null;
  }
  return verifyPassword(password, row.password_hash) ? toUser(row) : null;
}

export function getUserById(id: number): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

/**
 * Pravi admin račun ili (ako e-mail već postoji) postavlja novu lozinku i admin pravo.
 * Koristi se iz skripte `npm run admin:create`.
 */
export function upsertAdmin(input: { email: string; name: string; password: string }): { user: User; created: boolean } {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number } | undefined;
  if (existing) {
    db.prepare("UPDATE users SET password_hash = ?, is_admin = 1 WHERE id = ?").run(hashPassword(input.password), existing.id);
    return { user: getUserById(existing.id)!, created: false };
  }
  const user = createUser(input);
  db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(user.id);
  return { user: getUserById(user.id)!, created: true };
}

export function setRemindersEnabled(userId: number, enabled: boolean) {
  getDb().prepare("UPDATE users SET reminders_enabled = ? WHERE id = ?").run(enabled ? 1 : 0, userId);
}

// ───────────── Sesije ─────────────

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    userId,
    expiresAt.getTime(),
  );
  // Povremeno čistimo istekle sesije.
  if (Math.random() < 0.05) db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  return { token, expiresAt };
}

export function getUserBySessionToken(token: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), Date.now()) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function deleteSession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}
