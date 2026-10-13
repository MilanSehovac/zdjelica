import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Povrat i reklamacije",
  description: "Povrat neotvorenih proizvoda u roku od 14 dana i postupak za oštećene ili pogrešne pošiljke.",
  path: "/povrat-i-reklamacije",
});

export default function ReturnsPage() {
  return (
    <InfoPage title="Povrat i reklamacije" intro="Ako nešto nije kako treba, riješit ćemo to što prije.">
      <h2>Povrat u roku od 14 dana</h2>
      <p>
        Neotvoren proizvod u originalnom pakovanju možete vratiti u roku od 14 dana od preuzimanja. Javite nam se e-mailom na <a href={`mailto:${site.email}`}>{site.email}</a> sa brojem narudžbe, a mi ćemo vam poslati upute za povrat.
      </p>
      <ul>
        <li>Trošak slanja povrata snosi kupac, osim ako je proizvod neispravan ili pogrešan.</li>
        <li>Novac vraćamo u roku od 14 dana od prijema vraćenog proizvoda.</li>
        <li>Zbog higijene i sigurnosti hrane, otvorena pakovanja ne primamo nazad, osim ako su neispravna.</li>
      </ul>
      <h2>Oštećena ili pogrešna pošiljka</h2>
      <p>
        Ako ste dobili oštećen ili pogrešan proizvod, javite nam se u roku od 48 sati od preuzimanja i pošaljite fotografiju pakovanja. Proizvod zamjenjujemo ili vraćamo novac, bez troškova za vas.
      </p>
      <h2>Reklamacije</h2>
      <p>
        Reklamaciju podnesite e-mailom, uz broj narudžbe i opis problema. Odgovaramo u roku koji propisuje zakon. Ova pravila ne umanjuju vaša prava prema važećem zakonu o zaštiti potrošača.
      </p>
    </InfoPage>
  );
}
