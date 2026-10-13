import { getDb, nowIso } from "./db";
import { getProduct } from "./products";
import { site } from "./site";
import { sendMail, reminderMail } from "./email";
import { lastOrderDateBySlug } from "./orders";

const DAY = 24 * 60 * 60 * 1000;

type Row = {
  user_id: number;
  email: string;
  name: string;
  product_slug: string;
  interval_weeks: number;
  last_reminded_at: string | null;
};

/**
 * Šalje podsjetnike korisnicima koji su proizvod označili kao "redovno".
 *
 * Proizvod je na redu kad od zadnje (ne-otkazane) narudžbe prođe interval
 * minus {@link site.reminderLeadDays} dana. Jedan podsjetnik po ciklusu:
 * novi se šalje tek nakon nove narudžbe tog proizvoda.
 * Pokreće se iz cron-a preko /api/cron/reminders.
 */
export async function sendDueReminders(now = new Date()): Promise<{ users: number; sent: number; products: number }> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT f.user_id, u.email, u.name, f.product_slug, f.interval_weeks, f.last_reminded_at
       FROM favorites f JOIN users u ON u.id = f.user_id
       WHERE f.regular = 1 AND f.interval_weeks IS NOT NULL AND u.reminders_enabled = 1
       ORDER BY f.user_id`,
    )
    .all() as Row[];

  const byUser = new Map<number, Row[]>();
  for (const r of rows) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);

  let sent = 0;
  let productCount = 0;

  for (const [userId, favs] of byUser) {
    const lastOrders = lastOrderDateBySlug(userId);
    const due = favs.filter((f) => {
      const last = lastOrders.get(f.product_slug);
      if (!last) return false; // nikad naručeno: nema šta podsjećati
      const dueAt = new Date(last).getTime() + f.interval_weeks * 7 * DAY - site.reminderLeadDays * DAY;
      if (now.getTime() < dueAt) return false;
      return !f.last_reminded_at || f.last_reminded_at < last;
    });
    if (due.length === 0) continue;

    const items = due
      .map((f) => ({ name: getProduct(f.product_slug)?.name, weeks: f.interval_weeks, slug: f.product_slug }))
      .filter((i): i is { name: string; weeks: number; slug: string } => Boolean(i.name));
    if (items.length === 0) continue;

    const ok = await sendMail(reminderMail(favs[0].email, favs[0].name, items));
    if (!ok) continue;

    const mark = db.prepare("UPDATE favorites SET last_reminded_at = ? WHERE user_id = ? AND product_slug = ?");
    for (const i of items) mark.run(nowIso(), userId, i.slug);
    sent += 1;
    productCount += items.length;
  }

  return { users: byUser.size, sent, products: productCount };
}
