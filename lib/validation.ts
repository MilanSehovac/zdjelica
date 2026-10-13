import { z } from "zod";

export type FieldErrors = Record<string, string>;

/** Pretvara zod greške u mapu polje → prva poruka. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} je obavezno.` })
    .trim()
    .min(min, min <= 1 ? `${label} je obavezno.` : `${label} mora imati najmanje ${min} znaka.`)
    .max(max, `${label} može imati najviše ${max} znakova.`);

const email = z
  .string({ error: "E-mail adresa je obavezna." })
  .trim()
  .toLowerCase()
  .max(160, "E-mail adresa je predugačka.")
  .pipe(z.email("Unesite ispravnu e-mail adresu."));

export const registerSchema = z.object({
  name: text("Ime", 2, 80),
  email,
  password: z
    .string({ error: "Lozinka je obavezna." })
    .min(8, "Lozinka mora imati najmanje 8 znakova.")
    .max(128, "Lozinka je predugačka."),
  terms: z.literal("on", { error: "Morate prihvatiti uslove korištenja." }),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Lozinka je obavezna." }).min(1, "Lozinka je obavezna.").max(128),
});

export const checkoutSchema = z.object({
  name: text("Ime i prezime", 3, 80),
  email,
  phone: z
    .string({ error: "Telefon je obavezan." })
    .trim()
    .regex(/^\+?[0-9 /().-]{6,20}$/, "Unesite ispravan broj telefona."),
  address: text("Adresa", 4, 120),
  city: text("Grad", 2, 60),
  postalCode: z
    .string({ error: "Poštanski broj je obavezan." })
    .trim()
    .regex(/^[0-9]{5}$/, "Poštanski broj ima 5 cifara."),
  note: z.string().trim().max(500, "Napomena može imati najviše 500 znakova.").default(""),
  paymentMethod: z.literal("pouzece", { error: "Odaberite način plaćanja." }),
  terms: z.literal("on", { error: "Morate prihvatiti uslove kupovine." }),
  // Polje-mamac za botove; ljudi ga ne vide i ne popunjavaju.
  website: z.string().max(0).optional(),
  cart: z.string().max(5000),
});

export const newsletterSchema = z.object({
  email,
  website: z.string().max(0).optional(),
});

export const cartItemsSchema = z
  .array(z.object({ sku: z.string().max(120), quantity: z.number().int().min(1).max(100) }))
  .min(1, "Korpa je prazna.")
  .max(30);
