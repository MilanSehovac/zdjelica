import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Kontakt",
  description: "Kontaktirajte Zdjelicu e-mailom ili telefonom: pitanja o narudžbama, dostavi i proizvodima.",
  path: "/kontakt",
});

export default function ContactPage() {
  return (
    <InfoPage title="Kontakt" intro="Pitanje o narudžbi, dostavi ili proizvodu? Javite nam se.">
      <h2>Kako do nas</h2>
      <ul>
        <li>
          E-mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>
          Telefon: <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
        </li>
      </ul>
      <p>Uz poruku navedite broj narudžbe (počinje sa ZD-) da brže pronađemo vaše podatke.</p>
      <h2>Podaci o prodavcu</h2>
      <p>
        {site.legal.companyName}
        <br />
        {site.legal.companyAddress}
        <br />
        ID: {site.legal.companyId}
      </p>
    </InfoPage>
  );
}
