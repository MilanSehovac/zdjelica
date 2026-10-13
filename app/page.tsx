import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductArt } from "@/components/product-art";
import { HeroBowl } from "@/components/hero-bowl";
import { JsonLd } from "@/components/json-ld";
import { CATEGORIES, PETS, categoryUrl, type CategorySlug, type Pet } from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { guides } from "@/lib/guides";
import { formatKM } from "@/lib/money";
import { absoluteUrl, site } from "@/lib/site";

const faq = [
  {
    q: "Kako se plaća narudžba?",
    a: "Plaćanje je pouzećem, gotovinom kuriru pri preuzimanju paketa. Ne morate unositi podatke o kartici.",
  },
  {
    q: "Koliko traje dostava?",
    a: `Dostava traje ${site.shipping.estimate}. Za narudžbe od ${formatKM(site.shipping.freeOverCents)} dostava je besplatna, a ispod toga iznosi ${formatKM(site.shipping.flatCents)}.`,
  },
  {
    q: "Kako rade podsjetnici za redovnu narudžbu?",
    a: "U omiljenim proizvodima označite da neki proizvod uzimate redovno i odaberite razmak u sedmicama. Kad se približi vrijeme da vam ponestane, pošaljemo e-mail s linkom za novu narudžbu. Podsjetnike možete isključiti u svakom trenutku.",
  },
  {
    q: "Mogu li vratiti proizvod?",
    a: "Da. Neotvoren proizvod u originalnom pakovanju možete vratiti u roku od 14 dana, a oštećenu ili pogrešnu pošiljku zamjenjujemo bez troškova. Detalji su na stranici o povratu i reklamacijama.",
  },
];

export default function HomePage() {
  const featured = getProducts().filter((p) => p.featured);
  const pets: Pet[] = ["pas", "macka"];
  const cats = Object.keys(CATEGORIES) as CategorySlug[];

  return (
    <>
      <section className="container-page mt-4 md:mt-6" aria-labelledby="hero-title">
        <div className="grid items-center gap-8 rounded-[2rem] bg-mint px-6 py-10 md:grid-cols-[1.2fr_1fr] md:gap-10 md:px-14 md:py-16">
          <div>
            <h1 id="hero-title" className="max-w-[14ch] text-teal-deep md:max-w-[13ch]">
              Hrana koja stiže prije nego se zdjelica isprazni
            </h1>
            <p className="mb-7 mt-5 max-w-[34rem] text-lg text-ink">
              Odaberite hranu za psa ili mačku, označite da je uzimate redovno, a mi vas podsjetimo kad je vrijeme za novi paket. Plaćanje je pouzećem, a dostava ide širom BiH.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pas" className="btn btn-primary">Hrana za pse</Link>
              <Link href="/macka" className="btn btn-dark">Hrana za mačke</Link>
            </div>
            <ul className="mt-8 grid gap-2 text-[0.98rem] font-semibold text-teal-deep sm:grid-cols-1">
              {[
                "Plaćanje pouzećem, bez kartice",
                `Dostava ${site.shipping.estimate}`,
                `Besplatna dostava od ${formatKM(site.shipping.freeOverCents)}`,
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
                    <circle cx="10" cy="10" r="10" fill="#1b6460" />
                    <path d="m5.8 10.4 2.7 2.7 5.6-5.9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroBowl className="mx-auto w-full max-w-md" />
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="pets-title">
        <h2 id="pets-title" className="mb-6">Za koga birate hranu</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {pets.map((pet) => (
            <div key={pet} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
              <ProductArt
                pack={pet === "pas" ? "bag" : "pouch"}
                tone={pet === "pas" ? 0 : 2}
                pet={pet}
                className="h-40 w-40 shrink-0 rounded-2xl"
              />
              <div>
                <h3 className="text-2xl">{PETS[pet].plural}</h3>
                <ul className="mb-3 mt-2 flex flex-wrap gap-x-4 gap-y-0">
                  {cats.map((c) => (
                    <li key={c}>
                      <Link href={categoryUrl(pet, c)} className="inline-block py-1.5">
                        {pet === "macka" && c === "higijena" ? "Pijesak" : CATEGORIES[c].label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={categoryUrl(pet)} className="btn btn-outline btn-sm">
                  Sve za {PETS[pet].genitive}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="featured-title">
        <h2 id="featured-title" className="mb-6">Izdvajamo</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="regular-title">
        <div className="rounded-[2rem] bg-surface px-6 py-10 md:px-12 md:py-14">
          <h2 id="regular-title" className="max-w-xl">Redovna narudžba bez pamćenja</h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            Hrana i pijesak troše se ravnomjerno, pa ih ne treba svaki put ponovo tražiti.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Sačuvajte proizvod", "Kliknite na srce na proizvodu koji vaš ljubimac voli. Treba vam besplatan račun."],
              ["Označite razmak", "U omiljenim odaberite da proizvod uzimate redovno i na koliko sedmica."],
              ["Naručite jednim klikom", "Prije nego vam ponestane stiže e-mail s linkom, a vi samo potvrdite narudžbu."],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-butter font-display text-lg font-bold" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p className="mt-1 text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/registracija" className="btn btn-dark">Napravite račun</Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="guides-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="guides-title">Vodiči za vlasnike</h2>
          <Link href="/vodici" className="font-semibold">Svi vodiči</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {guides.slice(0, 3).map((g) => (
            <article key={g.slug} className="card relative p-6 transition-colors hover:border-teal">
              <h3>
                <Link href={`/vodici/${g.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:content-['']">
                  {g.title}
                </Link>
              </h3>
              <p className="mt-2 text-ink-soft">{g.description}</p>
              <p className="mt-3 text-sm font-semibold text-teal">{g.readMinutes} min čitanja</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page mt-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-6">Česta pitanja</h2>
        <div className="max-w-3xl divide-y divide-line rounded-[1.25rem] border border-line bg-surface">
          {faq.map((item) => (
            <details key={item.q} className="group px-5 py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold">
                {item.q}
                <svg viewBox="0 0 12 8" className="h-3 w-3 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true">
                  <path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="pb-4 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            logo: absoluteUrl("/icon.svg"),
            email: site.email,
            areaServed: { "@type": "Country", name: "Bosna i Hercegovina" },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            inLanguage: "bs",
            description: site.description,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
    </>
  );
}
