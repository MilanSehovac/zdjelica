"use server";

import { subscribe } from "@/lib/newsletter";
import { newsletterSchema, fieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/session";
import { sendMail, welcomeMail } from "@/lib/email";
import { pickValues, type FormState } from "@/lib/form-state";

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = pickValues(formData, ["email"]);
  const ip = await clientIp();
  if (!rateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000).ok) {
    return { values, message: "Previše pokušaja. Pokušajte ponovo kasnije." };
  }

  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if ("website" in errors) return { ok: true, message: "Hvala! Provjerite e-mail." }; // bot: ne otkrivamo ništa
    return { values, errors };
  }

  const isNew = subscribe(parsed.data.email, "footer");
  if (isNew) await sendMail(welcomeMail(parsed.data.email));
  // Isti odgovor za novu i postojeću adresu, da se ne otkriva ko je prijavljen.
  return { ok: true, message: "Hvala! Provjerite e-mail." };
}
