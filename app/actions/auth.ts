"use server";

import { redirect } from "next/navigation";
import { authenticate, createUser, EmailTakenError } from "@/lib/auth";
import { clientIp, endSession, safeNext, startSession } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";
import { pickValues, type FormState } from "@/lib/form-state";

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = pickValues(formData, ["name", "email", "next"]);
  const ip = await clientIp();
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000).ok) {
    return { values, message: "Previše pokušaja. Pokušajte ponovo za nekoliko minuta." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, errors: fieldErrors(parsed.error) };

  let userId: number;
  try {
    userId = createUser(parsed.data).id;
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { values, errors: { email: "Nalog s ovom adresom već postoji. Pokušajte se prijaviti." } };
    }
    throw err;
  }

  await startSession(userId);
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = pickValues(formData, ["email", "next"]);
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 15, 15 * 60 * 1000).ok) {
    return { values, message: "Previše pokušaja prijave. Pokušajte ponovo za nekoliko minuta." };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, errors: fieldErrors(parsed.error) };

  const user = authenticate(parsed.data.email, parsed.data.password);
  if (!user) return { values, message: "Pogrešan e-mail ili lozinka." };

  await startSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}
