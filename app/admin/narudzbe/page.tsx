import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { ORDER_STATUSES, STATUS_LABELS, listAllOrders, PAYMENT_METHODS } from "@/lib/orders";
import { listSubscribers } from "@/lib/newsletter";
import { orderNumber } from "@/lib/ids";
import { formatKM } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { getCurrentUser, isAdmin } from "@/lib/session";

export const metadata = { title: "Narudžbe (admin)", robots: { index: false, follow: false } };

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();
  const orders = listAllOrders();
  const subscribers = listSubscribers();
  const open = orders.filter((o) => o.status === "novo").length;

  return (
    <div className="container-page py-10">
      <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Narudžbe</h1>
      <p className="mb-8 mt-2 text-ink-soft">
        {orders.length} ukupno, {open} novih. Prijavljenih na newsletter: {subscribers.length}.
      </p>

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg">{orderNumber(o.id)}</h2>
                <p className="text-sm text-ink-soft">{formatDateTime(o.createdAt)}</p>
              </div>
              <form action={updateOrderStatusAction} className="flex items-end gap-2">
                <input type="hidden" name="id" value={o.id} />
                <div>
                  <label htmlFor={`status-${o.id}`} className="mb-1 block text-sm font-semibold">Status</label>
                  <select id={`status-${o.id}`} name="status" defaultValue={o.status} className="field !min-h-11 !w-auto">
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-dark btn-sm">Sačuvaj</button>
              </form>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <p className="text-[0.97rem]">
                <strong>{o.customer.name}</strong><br />
                {o.customer.email}<br />
                {o.customer.phone}<br />
                {o.customer.address}, {o.customer.postalCode} {o.customer.city}
                {o.customer.note ? <><br />Napomena: {o.customer.note}</> : null}
              </p>
              <div className="text-[0.97rem]">
                <ul className="space-y-1">
                  {o.items.map((i) => (
                    <li key={i.sku}>{i.productName} ({i.variantLabel}) × {i.quantity}</li>
                  ))}
                </ul>
                <p className="mt-2 font-bold">
                  {formatKM(o.totals.totalCents)} <span className="font-normal text-ink-soft">({PAYMENT_METHODS[o.customer.paymentMethod]})</span>
                </p>
              </div>
            </div>
          </li>
        ))}
        {orders.length === 0 ? <li className="card p-6 text-ink-soft">Još nema narudžbi.</li> : null}
      </ul>
    </div>
  );
}
