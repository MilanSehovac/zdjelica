"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/** Korpa živi u localStorage; server je nikad ne vidi dok kupac ne potvrdi narudžbu. */
export type CartLine = { sku: string; quantity: number };

const KEY = "zd-cart-v1";
const MAX_QTY = 20;
const EMPTY: CartLine[] = [];

const listeners = new Set<() => void>();
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    const lines = data
      .filter(
        (l): l is CartLine =>
          typeof l === "object" && l !== null && typeof (l as CartLine).sku === "string" && Number.isInteger((l as CartLine).quantity),
      )
      .map((l) => ({ sku: l.sku, quantity: Math.min(MAX_QTY, Math.max(1, l.quantity)) }));
    return lines.length ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, lines: parse(raw) };
  } catch {
    /* privatni način rada: koristimo ono što je u memoriji */
  }
  return cache.lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function emit() {
  for (const l of listeners) l();
}

function write(lines: CartLine[]) {
  const raw = lines.length ? JSON.stringify(lines) : null;
  try {
    if (raw) window.localStorage.setItem(KEY, raw);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignorišemo */
  }
  cache = { raw, lines: lines.length ? lines : EMPTY };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((sku: string, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.find((l) => l.sku === sku);
    write(
      existing
        ? current.map((l) => (l.sku === sku ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
        : [...current, { sku, quantity: Math.min(MAX_QTY, quantity) }],
    );
  }, []);

  const addMany = useCallback((items: CartLine[]) => {
    let current = getSnapshot();
    for (const item of items) {
      const existing = current.find((l) => l.sku === item.sku);
      current = existing
        ? current.map((l) => (l.sku === item.sku ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + item.quantity) } : l))
        : [...current, { sku: item.sku, quantity: Math.min(MAX_QTY, item.quantity) }];
    }
    write(current);
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    const current = getSnapshot();
    if (quantity < 1) write(current.filter((l) => l.sku !== sku));
    else write(current.map((l) => (l.sku === sku ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)));
  }, []);

  const remove = useCallback((sku: string) => write(getSnapshot().filter((l) => l.sku !== sku)), []);
  const clear = useCallback(() => write([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);

  return { lines, count, add, addMany, setQuantity, remove, clear, maxQuantity: MAX_QTY };
}

const subscribeNoop = () => () => {};
/** false pri serverskom renderovanju i prvom prolazu hidratacije, zatim true. */
export function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
