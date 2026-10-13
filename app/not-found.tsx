import Link from "next/link";

export const metadata = { title: "Stranica nije pronađena" };

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <h1 className="max-w-2xl">Ove stranice nema, ali zdjelica je puna na drugom mjestu</h1>
      <p className="mb-8 mt-4 max-w-xl text-ink-soft">
        Link je možda zastario ili je proizvod uklonjen. Odaberite jednu od kategorija ili se vratite na početnu.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/pas" className="btn btn-primary">Hrana za pse</Link>
        <Link href="/macka" className="btn btn-primary">Hrana za mačke</Link>
        <Link href="/" className="btn btn-outline">Početna</Link>
      </div>
    </div>
  );
}
