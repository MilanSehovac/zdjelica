"use client";

import Link from "next/link";
import { useCart } from "./cart-store";
import { useAuth } from "./auth-provider";

function Badge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-butter px-1 text-xs font-bold text-ink"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const iconLink =
  "relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2 text-ink no-underline hover:bg-mint-soft";

export function HeaderActions() {
  const { count } = useCart();
  const { status, user, favorites } = useAuth();
  const first = user?.name.split(" ")[0];

  return (
    <div className="flex items-center gap-1">
      <Link href={status === "user" ? "/racun" : "/prijava"} className={iconLink}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M4.8 20c.6-3.5 3.5-5.4 7.2-5.4s6.6 1.9 7.2 5.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <span className="hidden max-w-28 truncate text-[0.95rem] font-semibold sm:inline">{first ?? "Prijava"}</span>
        <span className="sr-only sm:hidden">{first ? `Moj račun, ${first}` : "Prijava"}</span>
      </Link>

      <Link href="/omiljeno" className={iconLink}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Omiljeni proizvodi{favorites.size ? `, ${favorites.size}` : ""}</span>
        <Badge count={favorites.size} />
      </Link>

      <Link href="/korpa" className={iconLink}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M5 8.5h14l-1.1 10.2a1.6 1.6 0 0 1-1.6 1.4H7.7a1.6 1.6 0 0 1-1.6-1.4L5 8.5Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M9 10.5V7.8a3 3 0 0 1 6 0v2.7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <span className="sr-only">Korpa{count ? `, ${count} ${count === 1 ? "artikal" : "artikala"}` : ", prazna"}</span>
        <Badge count={count} />
      </Link>
    </div>
  );
}
