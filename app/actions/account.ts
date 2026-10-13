"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { setRemindersEnabled } from "@/lib/auth";

export async function setRemindersAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  setRemindersEnabled(user.id, formData.get("enabled") === "on");
  revalidatePath("/racun");
}
