"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/actions/favorites";

type Me = { name: string; email: string; isAdmin: boolean } | null;
type Status = "loading" | "guest" | "user";

type AuthContextValue = {
  status: Status;
  user: Me;
  favorites: ReadonlySet<string>;
  toggleFavorite: (slug: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  favorites: new Set(),
  toggleFavorite: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function hasHintCookie() {
  return document.cookie.split("; ").some((c) => c === "zd_in=1");
}

/**
 * Stranice ostaju statične (brze i dobre za SEO); stanje prijave i omiljenih
 * učitava se tek ako postoji kolačić-nagovještaj. Gosti ne šalju nikakav zahtjev.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<Me>(null);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());
  const statusRef = useRef<Status>("loading");
  statusRef.current = status;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as { user: Me; favorites: string[] };
      setUser(data.user);
      setFavorites(new Set(data.favorites));
      setStatus(data.user ? "user" : "guest");
    } catch {
      setStatus("guest");
    }
  }, []);

  // Provjera pri učitavanju i nakon svake promjene stranice (npr. poslije prijave/odjave).
  useEffect(() => {
    const hint = hasHintCookie();
    if (hint && statusRef.current !== "user") void load();
    else if (!hint && statusRef.current !== "guest") {
      setUser(null);
      setFavorites(new Set());
      setStatus("guest");
    }
  }, [pathname, load]);

  const toggleFavorite = useCallback(
    async (slug: string) => {
      if (statusRef.current !== "user") {
        router.push(`/prijava?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const was = favorites.has(slug);
      const apply = (on: boolean) =>
        setFavorites((prev) => {
          const next = new Set(prev);
          if (on) next.add(slug);
          else next.delete(slug);
          return next;
        });
      apply(!was); // optimistično
      const result = await toggleFavoriteAction(slug);
      if (!result.ok) {
        apply(was);
        if (result.error === "login") router.push(`/prijava?next=${encodeURIComponent(window.location.pathname)}`);
      } else {
        apply(result.favorited);
      }
    },
    [favorites, router],
  );

  const value = useMemo(() => ({ status, user, favorites, toggleFavorite }), [status, user, favorites, toggleFavorite]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
