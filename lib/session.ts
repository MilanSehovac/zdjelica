import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createSession, deleteSession, getUserBySessionToken, type User } from "./auth";
import { site } from "./site";

const SESSION_COOKIE = "zd_session";
/** Nije osjetljiv: samo govori klijentu da vrijedi pitati server za stanje prijave. */
export const HINT_COOKIE = "zd_in";

const secure = site.url.startsWith("https://");

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return token ? getUserBySessionToken(token) : null;
});

export async function startSession(userId: number) {
  const { token, expiresAt } = createSession(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure, path: "/", expires: expiresAt });
  jar.set(HINT_COOKIE, "1", { httpOnly: false, sameSite: "lax", secure, path: "/", expires: expiresAt });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
  jar.delete(SESSION_COOKIE);
  jar.delete(HINT_COOKIE);
}

/** Dozvoljava samo interne putanje, da se spriječi preusmjeravanje na tuđe stranice. */
export function safeNext(value: unknown, fallback = "/racun"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export async function requireUser(next = "/racun"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/prijava?next=${encodeURIComponent(next)}`);
  return user;
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(user.email.toLowerCase());
}

/** Za admin stranice: ne-admin dobija 404, da se ne otkriva da stranica postoji. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) notFound();
  return user;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
