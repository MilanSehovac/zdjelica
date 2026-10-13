import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { site } from "@/lib/site";

const col = "flex flex-col gap-1";
const link = "inline-block py-1.5 text-white/90 underline-offset-4 hover:text-white";

export function Footer() {
  return (
    <footer className="on-dark mt-20 bg-teal-deep text-white">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-white">Savjeti o ishrani i novi proizvodi</h2>
          <p className="mb-5 mt-3 max-w-prose text-white/85">
            Nekoliko puta godišnje šaljemo kratke, korisne poruke za vlasnike pasa i mačaka.
          </p>
          <div className="max-w-xl">
            <NewsletterForm />
          </div>
        </div>
        <nav aria-label="Podnožje" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-2">
          <div className={col}>
            <h3 className="mb-1 text-base text-white">Prodavnica</h3>
            <Link className={link} href="/pas">Psi</Link>
            <Link className={link} href="/macka">Mačke</Link>
            <Link className={link} href="/vodici">Vodiči</Link>
            <Link className={link} href="/omiljeno">Omiljeno</Link>
          </div>
          <div className={col}>
            <h3 className="mb-1 text-base text-white">Pomoć</h3>
            <Link className={link} href="/dostava-i-placanje">Dostava i plaćanje</Link>
            <Link className={link} href="/povrat-i-reklamacije">Povrat i reklamacije</Link>
            <Link className={link} href="/kontakt">Kontakt</Link>
          </div>
          <div className={col}>
            <h3 className="mb-1 text-base text-white">Pravno</h3>
            <Link className={link} href="/uslovi-koristenja">Uslovi korištenja</Link>
            <Link className={link} href="/politika-privatnosti">Privatnost</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-white/80">
          <Logo inverse />
          <p>
            © {new Date().getFullYear()} {site.name}. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
