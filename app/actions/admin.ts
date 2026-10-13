"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { ORDER_STATUSES, updateOrderStatus, type OrderStatus } from "@/lib/orders";

export async function updateOrderStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return;
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !(ORDER_STATUSES as readonly string[]).includes(status)) return;
  updateOrderStatus(id, status as OrderStatus);
  revalidatePath("/admin/narudzbe");
}
