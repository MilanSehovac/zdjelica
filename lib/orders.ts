import { getDb, nowIso, transaction } from "./db";
import { parseSku } from "./products";
import { site } from "./site";
import { publicOrderId } from "./ids";

export const ORDER_STATUSES = ["novo", "kod-dobavljaca", "poslano", "isporuceno", "otkazano"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: "Primljena",
  "kod-dobavljaca": "Proslijeđena dobavljaču",
  poslano: "Poslana",
  isporuceno: "Isporučena",
  otkazano: "Otkazana",
};

export const PAYMENT_METHODS = { pouzece: "Plaćanje pouzećem" } as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const MAX_QTY_PER_LINE = 20;
export const MAX_LINES = 30;

export type CartInput = { sku: string; quantity: number }[];

export type PricedLine = {
  sku: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type Totals = { subtotalCents: number; shippingCents: number; totalCents: number };

export class CartError extends Error {}

/**
 * Cijene se UVIJEK računaju na serveru iz kataloga.
 * Klijent šalje samo šifre varijanti i količine.
 */
export function priceCart(input: CartInput): PricedLine[] {
  if (!Array.isArray(input) || input.length === 0) throw new CartError("Korpa je prazna.");
  if (input.length > MAX_LINES) throw new CartError("Korpa ima previše stavki.");

  const merged = new Map<string, number>();
  for (const item of input) {
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty < 1) throw new CartError("Količina mora biti najmanje 1.");
    merged.set(item.sku, Math.min(MAX_QTY_PER_LINE, (merged.get(item.sku) ?? 0) + qty));
  }

  const lines: PricedLine[] = [];
  for (const [sku, quantity] of merged) {
    const found = parseSku(sku);
    if (!found) throw new CartError("Jedan od proizvoda u korpi više nije dostupan. Osvježite korpu.");
    lines.push({
      sku,
      productSlug: found.product.slug,
      productName: found.product.name,
      variantLabel: found.variant.label,
      unitPriceCents: found.variant.priceCents,
      quantity,
      lineTotalCents: found.variant.priceCents * quantity,
    });
  }
  return lines;
}

export function computeTotals(lines: { lineTotalCents: number }[]): Totals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const shippingCents = subtotalCents === 0 || subtotalCents >= site.shipping.freeOverCents ? 0 : site.shipping.flatCents;
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
  paymentMethod: PaymentMethod;
};

export type Order = {
  id: number;
  publicId: string;
  userId: number | null;
  status: OrderStatus;
  customer: CustomerInput;
  items: PricedLine[];
  totals: Totals;
  createdAt: string;
};

type OrderRow = {
  id: number;
  public_id: string;
  user_id: number | null;
  status: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  note: string;
  payment_method: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
};

type ItemRow = {
  sku: string;
  product_slug: string;
  product_name: string;
  variant_label: string;
  unit_price_cents: number;
  quantity: number;
};

function hydrate(row: OrderRow, items: ItemRow[]): Order {
  return {
    id: row.id,
    publicId: row.public_id,
    userId: row.user_id,
    status: (ORDER_STATUSES as readonly string[]).includes(row.status) ? (row.status as OrderStatus) : "novo",
    customer: {
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      postalCode: row.postal_code,
      note: row.note,
      paymentMethod: row.payment_method as PaymentMethod,
    },
    items: items.map((i) => ({
      sku: i.sku,
      productSlug: i.product_slug,
      productName: i.product_name,
      variantLabel: i.variant_label,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
      lineTotalCents: i.unit_price_cents * i.quantity,
    })),
    totals: { subtotalCents: row.subtotal_cents, shippingCents: row.shipping_cents, totalCents: row.total_cents },
    createdAt: row.created_at,
  };
}

function loadItems(orderId: number): ItemRow[] {
  return getDb()
    .prepare("SELECT sku, product_slug, product_name, variant_label, unit_price_cents, quantity FROM order_items WHERE order_id = ? ORDER BY id")
    .all(orderId) as ItemRow[];
}

export function createOrder(cart: CartInput, customer: CustomerInput, userId: number | null): Order {
  const lines = priceCart(cart);
  const totals = computeTotals(lines);

  const orderId = transaction((db) => {
    const result = db
      .prepare(
        `INSERT INTO orders (public_id, user_id, status, name, email, phone, address, city, postal_code, note,
           payment_method, subtotal_cents, shipping_cents, total_cents, created_at)
         VALUES (?, ?, 'novo', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        publicOrderId(),
        userId,
        customer.name,
        customer.email.toLowerCase(),
        customer.phone,
        customer.address,
        customer.city,
        customer.postalCode,
        customer.note,
        customer.paymentMethod,
        totals.subtotalCents,
        totals.shippingCents,
        totals.totalCents,
        nowIso(),
      );
    const id = Number(result.lastInsertRowid);
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_slug, sku, product_name, variant_label, unit_price_cents, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const l of lines) {
      insertItem.run(id, l.productSlug, l.sku, l.productName, l.variantLabel, l.unitPriceCents, l.quantity);
    }
    return id;
  });

  return getOrderById(orderId)!;
}

export function getOrderById(id: number): Order | null {
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? hydrate(row, loadItems(row.id)) : null;
}

export function getOrderByPublicId(publicId: string): Order | null {
  const row = getDb().prepare("SELECT * FROM orders WHERE public_id = ?").get(publicId) as OrderRow | undefined;
  return row ? hydrate(row, loadItems(row.id)) : null;
}

export function listOrdersForUser(userId: number): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100")
    .all(userId) as OrderRow[];
  return rows.map((r) => hydrate(r, loadItems(r.id)));
}

export function listAllOrders(limit = 200): Order[] {
  const rows = getDb().prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?").all(limit) as OrderRow[];
  return rows.map((r) => hydrate(r, loadItems(r.id)));
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  if (!ORDER_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

/** Zadnja (ne-otkazana) narudžba svakog proizvoda za korisnika; koristi se za podsjetnike. */
export function lastOrderDateBySlug(userId: number): Map<string, string> {
  const rows = getDb()
    .prepare(
      `SELECT oi.product_slug AS slug, MAX(o.created_at) AS last
       FROM orders o JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ? AND o.status != 'otkazano'
       GROUP BY oi.product_slug`,
    )
    .all(userId) as { slug: string; last: string }[];
  return new Map(rows.map((r) => [r.slug, r.last]));
}
