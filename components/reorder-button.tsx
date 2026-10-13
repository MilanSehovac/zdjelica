"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartLine } from "./cart-store";

export function ReorderButton({ items, label = "Naruči ponovo" }: { items: CartLine[]; label?: string }) {
  const { addMany } = useCart();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-dark btn-sm"
      onClick={() => {
        addMany(items);
        router.push("/korpa");
      }}
    >
      {label}
    </button>
  );
}
