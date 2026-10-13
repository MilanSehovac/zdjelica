"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Pregled", exact: true },
  { href: "/admin/proizvodi", label: "Proizvodi" },
  { href: "/admin/narudzbe", label: "Narudžbe" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="border-b border-line bg-mint/60">
      <ul className="container-page flex flex-wrap gap-1 py-2">
        {ITEMS.map((i) => {
          const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 font-semibold no-underline ${
                  active ? "bg-teal text-white" : "text-ink hover:bg-white"
                }`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
