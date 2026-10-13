import { InfoPage } from "@/components/info-page";
import { formatKM } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Dostava i plaćanje",
  description: `Dostava širom BiH za ${site.shipping.estimate}, besplatna od ${formatKM(site.shipping.freeOverCents)}. Plaćanje pouzećem pri preuzimanju.`,
  path: "/dostava-i-placanje",
});

export default function ShippingPage() {
  return (
    <InfoPage title="Dostava i plaćanje" intro="Sve što trebate znati o tome kako i kada vaša narudžba stiže.">
      <h2>Dostava</h2>
      <p>
        Narudžbe dostavljamo kurirskom službom na kućnu adresu u cijeloj Bosni i Hercegovini. Očekivano vrijeme dostave je {site.shipping.estimate} od potvrde narudžbe.
      </p>
      <ul>
        <li>Dostava košta {formatKM(site.shipping.flatCents)}.</li>
        <li>Za narudžbe od {formatKM(site.shipping.freeOverCents)} dostava je besplatna.</li>
        <li>Kurir vas poziva prije dostave, zato unesite broj telefona koji javljate.</li>
        <li>Potvrdu narudžbe šaljemo e-mailom, a status možete pratiti u svom računu.</li>
      </ul>
      <h2>Plaćanje</h2>
      <p>
        Plaćanje je pouzećem, gotovinom kuriru pri preuzimanju paketa. Plaćanje karticom trenutno nije dostupno.
      </p>
      <h2>Prilikom preuzimanja</h2>
      <p>
        Provjerite da pakovanje nije oštećeno. Ako je paket vidno oštećen, nemojte ga preuzimati i javite nam se na <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </InfoPage>
  );
}
