"use server";

import { revalidatePath } from "next/cache";
import { setRegular, toggleFavorite, INTERVAL_OPTIONS } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/session";
import { getProduct } from "@/lib/products";

export type ToggleResult = { ok: true; favorited: boolean } | { ok: false; error: "login" | "invalid" };

export async function toggleFavoriteAction(slug: string): Promise<ToggleResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (typeof slug !== "string" || !getProduct(slug)) return { ok: false, error: "invalid" };
  const favorited = toggleFavorite(user.id, slug);
  revalidatePath("/omiljeno");
  return { ok: true, favorited };
}

export async function setRegularAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const slug = String(formData.get("slug") ?? "");
  if (!getProduct(slug)) return;
  const regular = formData.get("regular") === "on";
  const weeks = Number(formData.get("interval"));
  const interval = (INTERVAL_OPTIONS as readonly number[]).includes(weeks) ? weeks : undefined;
  setRegular(user.id, slug, regular, interval);
  revalidatePath("/omiljeno");
}
