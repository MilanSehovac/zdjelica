import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Politika privatnosti",
  description: "Koje podatke prikupljamo, zašto ih koristimo i kako možete ostvariti svoja prava.",
  path: "/politika-privatnosti",
});

export default function PrivacyPage() {
  return (
    <InfoPage title="Politika privatnosti" intro="Prikupljamo samo ono što je potrebno da vam isporučimo narudžbu i vodimo vaš račun.">
      <h2>Ko obrađuje podatke</h2>
      <p>
        {site.legal.companyName}, {site.legal.companyAddress}, ID: {site.legal.companyId}. Kontakt za pitanja o privatnosti: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Koje podatke prikupljamo</h2>
      <ul>
        <li>Podaci iz narudžbe: ime i prezime, e-mail, telefon, adresa dostave, napomena i sadržaj narudžbe.</li>
        <li>Podaci računa: ime, e-mail i lozinka. Lozinka se čuva samo u zaštićenom (hashiranom) obliku.</li>
        <li>Omiljeni proizvodi i raspored podsjetnika, ako ih koristite.</li>
        <li>E-mail adresa za newsletter, ako se prijavite.</li>
      </ul>
      <h2>Zašto ih koristimo</h2>
      <ul>
        <li>Da obradimo i isporučimo narudžbu, što je potrebno za izvršenje kupoprodaje.</li>
        <li>Da vodimo vaš račun i šaljemo podsjetnike koje ste sami uključili.</li>
        <li>Da šaljemo newsletter, samo uz vašu saglasnost. Odjava je moguća u svakom trenutku.</li>
      </ul>
      <h2>S kim ih dijelimo</h2>
      <p>
        Podatke potrebne za isporuku (ime, adresa, telefon, sadržaj narudžbe) dostavljamo proizvođaču ili dobavljaču koji priprema pošiljku i kurirskoj službi koja je dostavlja. Za slanje e-poruka koristimo uslugu e-pošte. Podatke ne prodajemo.
      </p>
      <h2>Kolačići i lokalno čuvanje</h2>
      <p>
        Koristimo samo neophodne kolačiće: za prijavu u račun i za prepoznavanje da ste prijavljeni. Sadržaj korpe čuva se u vašem pretraživaču. Ne koristimo kolačiće za oglašavanje niti praćenje.
      </p>
      <h2>Koliko dugo čuvamo podatke</h2>
      <p>
        Podatke o narudžbama čuvamo koliko zahtijevaju zakonski rokovi, a podatke računa dok ga ne obrišete.
      </p>
      <h2>Vaša prava</h2>
      <p>
        Možete tražiti uvid u svoje podatke, ispravku, brisanje ili ograničenje obrade. Pošaljite zahtjev na <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </InfoPage>
  );
}
