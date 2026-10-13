import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { listAllProducts } from "@/lib/products";
import { listAllOrders } from "@/lib/orders";
import { listSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminHome() {
  await requireAdmin();
  const products = listAllProducts();
  const orders = listAllOrders();
  const stats = [
    { label: "Proizvodi u shopu", value: products.filter((p) => p.active).length, note: `${products.length - products.filter((p) => p.active).length} skrivenih`, href: "/admin/proizvodi" },
    { label: "Nove narudžbe", value: orders.filter((o) => o.status === "novo").length, note: `${orders.length} ukupno`, href: "/admin/narudzbe" },
    { label: "Prijavljeni na newsletter", value: listSubscribers().length, note: "adrese u bazi", href: "/admin/narudzbe" },
  ];
  return (
    <div className="container-page py-10">
      <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Admin</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className="card p-5">
            <p className="text-sm font-semibold text-ink-soft">{s.label}</p>
            <p className="mt-1 text-4xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.note}</p>
            <Link href={s.href} className="mt-3 inline-block py-1 font-semibold">Otvori</Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/admin/proizvodi/novi" className="btn btn-primary">Dodaj proizvod</Link>
      </p>
    </div>
  );
}
