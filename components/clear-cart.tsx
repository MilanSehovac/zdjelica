"use client";

import { useEffect } from "react";
import { useCart } from "./cart-store";

/** Prazni korpu nakon uspješne narudžbe i skida `?novo=1` iz adrese. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    window.history.replaceState(null, "", window.location.pathname);
  }, [clear]);
  return null;
}
