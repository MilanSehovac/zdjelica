import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * Poziva se jednom dnevno (cron):
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://vasa-domena.ba/api/cron/reminders
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET nije podešen." }, { status: 503 });
  }
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendDueReminders();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
