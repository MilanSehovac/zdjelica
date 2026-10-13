import Link from "next/link";
import { site } from "@/lib/site";

export function LogoMark({ className = "h-9 w-9", inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="3.2" fill="#f7c948" />
      <circle cx="20.5" cy="9.5" r="3.2" fill="#f7c948" />
      <circle cx="28" cy="13.5" r="3.2" fill="#f7c948" />
      <path d="M4 19h32a16 16 0 0 1-32 0Z" fill={inverse ? "#d6ebe4" : "#1b6460"} />
      <rect x="2.5" y="17" width="35" height="4.5" rx="2.25" fill={inverse ? "#ffffff" : "#124845"} />
    </svg>
  );
}

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 no-underline ${inverse ? "text-white" : "text-ink"}`}
      aria-label={`${site.name}, početna stranica`}
    >
      <LogoMark inverse={inverse} />
      <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight">{site.name}</span>
    </Link>
  );
}
