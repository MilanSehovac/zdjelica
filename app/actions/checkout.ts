"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, clientIp } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { cartItemsSchema, checkoutSchema, fieldErrors } from "@/lib/validation";
import { CartError, createOrder } from "@/lib/orders";
import { orderConfirmationMail, ownerNotificationMail, sendMail } from "@/lib/email";
import { pickValues, type FormState } from "@/lib/form-state";

const KEEP = ["name", "email", "phone", "address", "city", "postalCode", "note"];

export async function placeOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = pickValues(formData, KEEP);

  const ip = await clientIp();
  if (!rateLimit(`order:${ip}`, 8, 60 * 60 * 1000).ok) {
    return { values, message: "Previše narudžbi u kratkom roku. Pokušajte ponovo kasnije ili nas kontaktirajte." };
  }

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if ("website" in errors) return { values, message: "Narudžba nije prihvaćena." };
    return { values, errors, message: "Provjerite označena polja." };
  }

  let cart;
  try {
    cart = cartItemsSchema.parse(JSON.parse(parsed.data.cart));
  } catch {
    return { values, message: "Korpa je prazna ili nije ispravna. Vratite se u korpu i pokušajte ponovo." };
  }

  const user = await getCurrentUser();
  let order;
  try {
    const { cart: _cart, terms: _terms, website: _website, ...customer } = parsed.data;
    order = createOrder(cart, customer, user?.id ?? null);
  } catch (err) {
    if (err instanceof CartError) return { values, message: err.message };
    throw err;
  }

  // Greška u slanju pošte ne smije poništiti narudžbu.
  await Promise.allSettled([
    sendMail(orderConfirmationMail(order)),
    process.env.ORDER_NOTIFY_EMAIL ? sendMail(ownerNotificationMail(order, process.env.ORDER_NOTIFY_EMAIL)) : Promise.resolve(true),
  ]);

  redirect(`/narudzba/${order.publicId}?novo=1`);
}
