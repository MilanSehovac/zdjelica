import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { formatKM } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Uslovi korištenja",
  description: "Opšti uslovi kupovine i korištenja web prodavnice Zdjelica.",
  path: "/uslovi-koristenja",
});

export default function TermsPage() {
  return (
    <InfoPage title="Uslovi korištenja" intro="Ovi uslovi uređuju kupovinu u web prodavnici Zdjelica.">
      <h2>Prodavac</h2>
      <p>
        {site.legal.companyName}, {site.legal.companyAddress}, ID: {site.legal.companyId}. Kontakt: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Narudžba</h2>
      <p>
        Narudžba se smatra primljenom kad vam pošaljemo potvrdu e-mailom. Zadržavamo pravo da odbijemo ili otkažemo narudžbu u slučaju nedostupnosti proizvoda ili očigledne greške u cijeni, o čemu ćemo vas odmah obavijestiti.
      </p>
      <h2>Cijene i plaćanje</h2>
      <p>
        Cijene su izražene u konvertibilnim markama (KM). Plaćanje je pouzećem pri preuzimanju. Dostava košta {formatKM(site.shipping.flatCents)}, a za narudžbe od {formatKM(site.shipping.freeOverCents)} je besplatna.
      </p>
      <h2>Dostava, povrat i reklamacije</h2>
      <p>
        Uslovi dostave opisani su na stranici <Link href="/dostava-i-placanje">Dostava i plaćanje</Link>, a povrata i reklamacija na stranici <Link href="/povrat-i-reklamacije">Povrat i reklamacije</Link>.
      </p>
      <h2>Korisnički račun</h2>
      <p>
        Odgovorni ste za tačnost podataka i za čuvanje lozinke. Račun možete obrisati na zahtjev, e-mailom.
      </p>
      <h2>Vodiči i savjeti</h2>
      <p>
        Tekstovi na ovoj stranici su opšte informacije i ne zamjenjuju savjet veterinara.
      </p>
      <h2>Mjerodavno pravo</h2>
      <p>Na ove uslove primjenjuje se pravo Bosne i Hercegovine.</p>
    </InfoPage>
  );
}
