import Link from "next/link";
import { Logo } from "./logo";
import { HeaderActions } from "./header-actions";

const links = [
  { href: "/pas", label: "Psi" },
  { href: "/macka", label: "Mačke" },
  { href: "/vodici", label: "Vodiči" },
  { href: "/dostava-i-placanje", label: "Dostava" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 md:flex-nowrap">
        <Logo />
        <nav aria-label="Glavna navigacija" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:overflow-visible md:pb-0">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold text-ink no-underline hover:bg-mint-soft"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}
