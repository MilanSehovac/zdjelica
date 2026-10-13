/**
 * Središnje mjesto za sve podatke o prodavnici.
 * Promjena imena, kontakta ili pravila dostave radi se ovdje.
 */
export const site = {
  name: "Zdjelica",
  tagline: "Hrana za ljubimce koja stiže prije nego se zdjelica isprazni",
  description:
    "Zdjelica je online prodavnica hrane i potrepština za pse i mačke u BiH. Odaberite hranu, podesite razmak narudžbe i mi vas podsjetimo kad paket treba obnoviti.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "bs_BA",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@zdjelica.ba",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+387 00 000 000",
  currency: "BAM",
  currencyLabel: "KM",
  /** Podaci o firmi za pravne stranice. OBAVEZNO popuniti prije puštanja u rad. */
  legal: {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "[UPISATI: naziv firme]",
    companyAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "[UPISATI: adresa firme]",
    companyId: process.env.NEXT_PUBLIC_COMPANY_ID ?? "[UPISATI: JIB / ID broj]",
  },
  shipping: {
    flatCents: 600,
    freeOverCents: 7000,
    estimate: "2 do 4 radna dana",
  },
  /** Koliko dana unaprijed šaljemo podsjetnik prije nego se paket potroši. */
  reminderLeadDays: 5,
} as const;

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
