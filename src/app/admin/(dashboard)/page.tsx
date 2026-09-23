import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileSpreadsheet, PackageOpen, Search, Store, Truck, X } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import {
  PAGE_SIZE,
  filtersToQuery,
  listOrders,
  orderStats,
  parseOrderFilters,
  statusCounts,
  type StatusFilter,
} from "@/lib/admin-orders";
import { cedis, orderDate } from "@/lib/format";
import { StatusSelect } from "./orders/StatusBits";
import { OrderRowLink } from "./orders/OrderRowLink";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "new", label: "New" },
  { key: "paid", label: "Paid" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

export default async function OrdersPage(props: PageProps<"/admin">) {
  await requireAdmin();
  const f = parseOrderFilters(await props.searchParams);
  const [{ rows, total, pages }, counts, stats] = await Promise.all([listOrders(f), statusCounts(f), orderStats()]);
  const hasFilters = Boolean(f.q || f.from || f.to || f.fulfilment || f.payment);
  const start = total === 0 ? 0 : (f.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(f.page * PAGE_SIZE, total);

  const input =
    "w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold text-forest">Orders</h1>
        <a
          href={`/admin/orders/export${filtersToQuery(f, { page: 1 })}`}
          className="flex items-center gap-2 rounded-full bg-[#1d6f42] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export to Excel
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{total}</span>
        </a>
      </div>

      {/* At-a-glance numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "New orders", value: String(stats.newCount), accent: stats.newCount > 0 },
          { label: "Open orders", value: String(stats.openCount) },
          { label: `Today · ${stats.todayCount} order${stats.todayCount === 1 ? "" : "s"}`, value: cedis(stats.todayValue) },
          { label: `This month · ${stats.monthCount} orders`, value: cedis(stats.monthValue) },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 ring-1 ${c.accent ? "bg-kente/15 ring-kente/40" : "bg-white ring-sand"}`}>
            <p className="text-xs font-semibold text-muted">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-forest">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
        {/* Status tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b border-sand px-3 pt-3" aria-label="Filter by status">
          {TABS.map((t) => {
            const active = f.status === t.key;
            return (
              <Link
                key={t.key}
                href={`/admin${filtersToQuery(f, { status: t.key, page: 1 })}`}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold transition ${
                  active ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-forest text-cream" : "bg-sand text-muted"}`}>
                  {counts[t.key]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Search & filters (plain GET form, so filters live in the URL and can be bookmarked) */}
        <form action="/admin" className="grid gap-3 border-b border-sand bg-paper/60 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
          {f.status !== "open" && <input type="hidden" name="status" value={f.status} />}
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={f.q} placeholder="Order #, name or phone" className={`${input} pl-9`} />
          </label>
          <label className="text-xs font-semibold text-muted">
            <span className="sr-only">From date</span>
            <input type="date" name="from" defaultValue={f.from} aria-label="From date" className={input} />
          </label>
          <label className="text-xs font-semibold text-muted">
            <span className="sr-only">To date</span>
            <input type="date" name="to" defaultValue={f.to} aria-label="To date" className={input} />
          </label>
          <select name="fulfilment" defaultValue={f.fulfilment} aria-label="Pickup or delivery" className={input}>
            <option value="">Pickup & delivery</option>
            <option value="pickup">Pickup only</option>
            <option value="delivery">Delivery only</option>
          </select>
          <select name="payment" defaultValue={f.payment} aria-label="Payment method" className={input}>
            <option value="">Any payment</option>
            <option value="momo">MoMo</option>
            <option value="cash">Cash</option>
          </select>
          <div className="flex gap-2">
            <button className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep">Apply</button>
            {hasFilters && (
              <Link
                href={`/admin${f.status !== "open" ? `?status=${f.status}` : ""}`}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-sand"
              >
                <X className="h-4 w-4" /> Clear
              </Link>
            )}
          </div>
        </form>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <PackageOpen className="h-10 w-10 text-leaf" />
            <p className="font-semibold text-forest">No orders here</p>
            <p className="text-sm text-muted">{hasFilters ? "Try clearing the filters." : "New orders will appear here."}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-paper/60 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {rows.map((o) => (
                  <OrderRowLink key={o.id} href={`/admin/orders/${o.code}`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.code}`} className="font-display font-semibold tracking-wide text-forest hover:underline">
                        {o.code}
                      </Link>
                      <p className="text-xs text-muted">{orderDate(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted">{o.phone}</p>
                    </td>
                    <td className="max-w-[16rem] px-4 py-3">
                      <p className="truncate" title={o.items.map((i) => `${i.quantity} x ${i.name}`).join(", ")}>
                        {o.items.map((i) => `${i.quantity} x ${i.name}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted">{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{cedis(o.subtotalPesewas)}</td>
                    <td className="px-4 py-3">
                      <TypeBadge fulfilment={o.fulfilment} payment={o.paymentMethod} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect id={o.id} status={o.status} compact />
                    </td>
                  </OrderRowLink>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-sand md:hidden">
              {rows.map((o) => (
                <li key={o.id} className="flex items-start justify-between gap-3 p-4">
                  <Link href={`/admin/orders/${o.code}`} className="min-w-0 flex-1">
                    <p className="font-display font-semibold tracking-wide text-forest">{o.code}</p>
                    <p className="truncate text-sm">{o.customerName} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}</p>
                    <p className="text-xs text-muted">{orderDate(o.createdAt)}</p>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold">{cedis(o.subtotalPesewas)}</span>
                    <StatusSelect id={o.id} status={o.status} compact />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-sand px-4 py-3 text-sm">
            <p className="text-muted">
              Showing <strong className="text-ink">{start}-{end}</strong> of <strong className="text-ink">{total}</strong>
            </p>
            <div className="flex items-center gap-1">
              <PageLink href={f.page > 1 ? `/admin${filtersToQuery(f, { page: f.page - 1 })}` : null} label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </PageLink>
              <span className="px-2 text-muted">
                Page {f.page} of {pages}
              </span>
              <PageLink href={f.page < pages ? `/admin${filtersToQuery(f, { page: f.page + 1 })}` : null} label="Next page">
                <ChevronRight className="h-4 w-4" />
              </PageLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ fulfilment, payment }: { fulfilment: "pickup" | "delivery"; payment: "momo" | "cash" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      {fulfilment === "pickup" ? <Store className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
      {fulfilment === "pickup" ? "Pickup" : "Delivery"} · {payment === "momo" ? "MoMo" : "Cash"}
    </span>
  );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  const cls = "flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-sand";
  return href ? (
    <Link href={href} aria-label={label} className={`${cls} hover:bg-sand`}>
      {children}
    </Link>
  ) : (
    <span aria-hidden="true" className={`${cls} opacity-40`}>
      {children}
    </span>
  );
}
