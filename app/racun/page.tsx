import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { setRemindersAction } from "@/app/actions/account";
import { ReorderButton } from "@/components/reorder-button";
import { listOrdersForUser, STATUS_LABELS } from "@/lib/orders";
import { orderNumber } from "@/lib/ids";
import { formatKM } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { isAdmin, requireUser } from "@/lib/session";

export const metadata = pageMetadata({ title: "Moj račun", description: "Podaci o računu i narudžbe.", path: "/racun", noindex: true });

export default async function AccountPage() {
  const user = await requireUser("/racun");
  const orders = listOrdersForUser(user.id);

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Zdravo, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-ink-soft">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-outline btn-sm">Odjavi se</button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-6" aria-labelledby="fav-title">
          <h2 id="fav-title" className="text-xl">Omiljeni proizvodi</h2>
          <p className="mb-4 mt-2 text-ink-soft">Proizvodi koje uzimate redovno možete označiti da vas podsjetimo na vrijeme.</p>
          <Link href="/omiljeno" className="btn btn-dark btn-sm">Otvori omiljene</Link>
        </section>

        <section className="card p-6" aria-labelledby="remind-title">
          <h2 id="remind-title" className="text-xl">Podsjetnici e-mailom</h2>
          <form action={setRemindersAction} className="mt-3 space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="enabled" defaultChecked={user.remindersEnabled} className="mt-1.5 h-5 w-5 shrink-0 accent-teal" />
              <span>Šaljite mi podsjetnik kad se približi vrijeme za novu narudžbu redovnih proizvoda.</span>
            </label>
            <button type="submit" className="btn btn-outline btn-sm">Sačuvaj</button>
          </form>
        </section>
      </div>

      {isAdmin(user) ? (
        <p className="mt-6">
          <Link href="/admin" className="btn btn-primary btn-sm">Admin dashboard</Link>
        </p>
      ) : null}

      <section className="mt-12" aria-labelledby="orders-title">
        <h2 id="orders-title" className="mb-4">Moje narudžbe</h2>
        {orders.length === 0 ? (
          <div className="card p-6">
            <p className="text-ink-soft">Još nemate narudžbi. Kad naručite prijavljeni, ovdje ćete ih vidjeti i moći ih ponoviti jednim klikom.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg">
                      <Link href={`/narudzba/${o.publicId}`}>{orderNumber(o.id)}</Link>
                    </h3>
                    <p className="text-sm text-ink-soft">
                      {formatDate(o.createdAt)}, {STATUS_LABELS[o.status]}
                    </p>
                  </div>
                  <p className="font-bold">{formatKM(o.totals.totalCents)}</p>
                </div>
                <ul className="mt-3 space-y-1 text-[0.97rem] text-ink-soft">
                  {o.items.map((i) => (
                    <li key={i.sku}>
                      {i.productName} ({i.variantLabel}), količina {i.quantity}
                    </li>
                  ))}
                </ul>
                {o.status !== "otkazano" ? (
                  <div className="mt-4">
                    <ReorderButton items={o.items.map((i) => ({ sku: i.sku, quantity: i.quantity }))} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
