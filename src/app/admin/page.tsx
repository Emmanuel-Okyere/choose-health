import type { Metadata } from "next";
import { getRecentOrders, type OrderStatus } from "@/lib/queries";
import { cedis } from "@/lib/format";
import { toWhatsAppNumber, whatsappLink } from "@/lib/site";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };

const statusStyle: Record<OrderStatus, string> = {
  new: "bg-kente/25 text-forest-deep",
  paid: "bg-leaf/20 text-leaf-dark",
  ready: "bg-sky-100 text-sky-800",
  completed: "bg-sand text-muted",
  cancelled: "bg-cayenne/15 text-cayenne",
};

export default async function AdminPage() {
  const orders = await getRecentOrders();
  const open = orders.filter((o) => o.status === "new" || o.status === "paid" || o.status === "ready");
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.subtotalPesewas, 0);

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-forest">Orders</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Open orders", String(open.length)],
            ["All orders (last 100)", String(orders.length)],
            ["Order value (excl. cancelled)", cedis(revenue)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-1 font-display text-3xl font-semibold text-forest">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-forest">
                    {o.code}{" "}
                    <span className={`ml-2 rounded-full px-2.5 py-0.5 align-middle font-sans text-xs font-bold uppercase ${statusStyle[o.status]}`}>
                      {o.status}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {new Date(o.createdAt).toLocaleString("en-GB")} · {o.customerName} ·{" "}
                    <a className="underline" href={whatsappLink(`Hello ${o.customerName}, about your order ${o.code}…`, toWhatsAppNumber(o.phone))} target="_blank" rel="noopener noreferrer">
                      {o.phone}
                    </a>
                  </p>
                  <p className="text-sm text-muted">
                    {o.fulfilment === "pickup" ? "Pickup" : `Delivery: ${o.address}`} · {o.paymentMethod === "momo" ? "MoMo" : "Cash"}
                  </p>
                </div>
                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className="rounded-lg border border-sand bg-white px-3 py-2 text-sm">
                    {Object.keys(statusStyle).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-cream">Update</button>
                </form>
              </div>
              <ul className="mt-3 text-sm">
                {o.items.map((i) => (
                  <li key={i.name}>
                    {i.quantity} × {i.name} — {cedis(i.quantity * i.unitPricePesewas)}
                  </li>
                ))}
              </ul>
              {o.note && <p className="mt-2 text-sm italic text-muted">“{o.note}”</p>}
              <p className="mt-2 font-semibold">Total {cedis(o.subtotalPesewas)}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
