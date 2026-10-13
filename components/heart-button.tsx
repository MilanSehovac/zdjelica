"use client";

import { useAuth } from "./auth-provider";

export function HeartButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const { favorites, toggleFavorite } = useAuth();
  const active = favorites.has(slug);

  return (
    <button
      type="button"
      onClick={() => void toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? `Ukloni iz omiljenih: ${name}` : `Dodaj u omiljene: ${name}`}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-ink transition-colors hover:bg-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.3A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3Z"
          fill={active ? "#c23b22" : "none"}
          stroke={active ? "#c23b22" : "currentColor"}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
