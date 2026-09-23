import "server-only";
import type { Fragment } from "postgres";
import { sql } from "./db";
import type { OrderStatus } from "./queries";

export const ORDER_STATUSES: OrderStatus[] = ["new", "paid", "ready", "completed", "cancelled"];
export const OPEN_STATUSES: OrderStatus[] = ["new", "paid", "ready"];
export const PAGE_SIZE = 20;

export type StatusFilter = OrderStatus | "open" | "all";

export type OrderFilters = {
  status: StatusFilter;
  q: string;
  from: string; // YYYY-MM-DD (inclusive)
  to: string; // YYYY-MM-DD (inclusive)
  fulfilment: "" | "pickup" | "delivery";
  payment: "" | "momo" | "cash";
  page: number;
};

export type AdminOrderRow = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  fulfilment: "pickup" | "delivery";
  address: string | null;
  paymentMethod: "momo" | "cash";
  note: string | null;
  subtotalPesewas: number;
  status: OrderStatus;
  createdAt: Date;
  statusUpdatedAt: Date | null;
  statusUpdatedBy: string | null;
  itemCount: number;
  items: { name: string; unitPricePesewas: number; quantity: number }[];
};

type SearchParams = Record<string, string | string[] | undefined>;

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Parses and sanitises the ?query string shared by the orders page and the Excel export. */
export function parseOrderFilters(params: SearchParams | URLSearchParams): OrderFilters {
  const get = (k: string) =>
    params instanceof URLSearchParams ? (params.get(k) ?? "") : first(params[k]);
  const status = get("status");
  const fulfilment = get("fulfilment");
  const payment = get("payment");
  return {
    status: status === "all" || ORDER_STATUSES.includes(status as OrderStatus) ? (status as StatusFilter) : "open",
    q: get("q").trim().slice(0, 80),
    from: isDate(get("from")) ? get("from") : "",
    to: isDate(get("to")) ? get("to") : "",
    fulfilment: fulfilment === "pickup" || fulfilment === "delivery" ? fulfilment : "",
    payment: payment === "momo" || payment === "cash" ? payment : "",
    page: Math.max(1, Math.floor(Number(get("page")) || 1)),
  };
}

/** Rebuilds a query string from filters (dropping defaults), with optional overrides. */
export function filtersToQuery(f: OrderFilters, overrides: Partial<Record<keyof OrderFilters, string | number>> = {}) {
  const merged = { ...f, ...overrides };
  const qs = new URLSearchParams();
  if (merged.status !== "open") qs.set("status", String(merged.status));
  for (const k of ["q", "from", "to", "fulfilment", "payment"] as const) if (merged[k]) qs.set(k, String(merged[k]));
  if (Number(merged.page) > 1) qs.set("page", String(merged.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function where(f: OrderFilters, { ignoreStatus = false } = {}): Fragment {
  const conds: Fragment[] = [];
  if (!ignoreStatus) {
    if (f.status === "open") conds.push(sql`o.status IN ${sql(OPEN_STATUSES)}`);
    else if (f.status !== "all") conds.push(sql`o.status = ${f.status}`);
  }
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, "\\$&")}%`;
    const digits = f.q.replace(/\D/g, "");
    conds.push(sql`(o.code ILIKE ${like} OR o.customer_name ILIKE ${like}
      ${digits.length >= 3 ? sql`OR o.phone LIKE ${`%${digits.replace(/^0/, "")}%`}` : sql``})`);
  }
  // Ghana is on UTC all year, so calendar days in UTC match local days.
  if (f.from) conds.push(sql`o.created_at >= ${f.from}::date`);
  if (f.to) conds.push(sql`o.created_at < ${f.to}::date + 1`);
  if (f.fulfilment) conds.push(sql`o.fulfilment = ${f.fulfilment}`);
  if (f.payment) conds.push(sql`o.payment_method = ${f.payment}`);
  if (conds.length === 0) return sql``;
  return sql`WHERE ${conds.reduce((acc, c) => sql`${acc} AND ${c}`)}`;
}

const selectWithItems = sql`
  SELECT o.*,
    COALESCE(sum(i.quantity), 0)::int AS item_count,
    COALESCE(json_agg(json_build_object('name', i.name, 'unitPricePesewas', i.unit_price_pesewas,
                                        'quantity', i.quantity) ORDER BY i.id)
             FILTER (WHERE i.id IS NOT NULL), '[]') AS items
  FROM orders o LEFT JOIN order_items i ON i.order_id = o.id`;

export async function listOrders(f: OrderFilters) {
  const [rows, [{ total }]] = await Promise.all([
    sql<AdminOrderRow[]>`${selectWithItems} ${where(f)} GROUP BY o.id
      ORDER BY o.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(f.page - 1) * PAGE_SIZE}`,
    sql<{ total: number }[]>`SELECT count(*)::int AS total FROM orders o ${where(f)}`,
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Everything matching the filters (no paging), for the Excel export. */
export async function exportOrders(f: OrderFilters, limit = 20000) {
  return sql<AdminOrderRow[]>`${selectWithItems} ${where(f)} GROUP BY o.id
    ORDER BY o.created_at DESC LIMIT ${limit}`;
}

/** Counts per status tab, respecting every filter except the status itself. */
export async function statusCounts(f: OrderFilters) {
  const rows = await sql<{ status: OrderStatus; count: number }[]>`
    SELECT o.status, count(*)::int AS count FROM orders o ${where(f, { ignoreStatus: true })} GROUP BY o.status`;
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const r of rows) counts[r.status] = r.count;
  return {
    ...counts,
    open: OPEN_STATUSES.reduce((n, s) => n + counts[s], 0),
    all: ORDER_STATUSES.reduce((n, s) => n + counts[s], 0),
  };
}

export async function orderStats() {
  const [s] = await sql<{ newCount: number; openCount: number; todayCount: number; todayValue: number; monthValue: number; monthCount: number }[]>`
    SELECT
      count(*) FILTER (WHERE status = 'new')::int AS new_count,
      count(*) FILTER (WHERE status IN ('new','paid','ready'))::int AS open_count,
      count(*) FILTER (WHERE created_at >= current_date AND status <> 'cancelled')::int AS today_count,
      COALESCE(sum(subtotal_pesewas) FILTER (WHERE created_at >= current_date AND status <> 'cancelled'), 0)::int AS today_value,
      count(*) FILTER (WHERE created_at >= date_trunc('month', current_date) AND status <> 'cancelled')::int AS month_count,
      COALESCE(sum(subtotal_pesewas) FILTER (WHERE created_at >= date_trunc('month', current_date) AND status <> 'cancelled'), 0)::int AS month_value
    FROM orders`;
  return s;
}

export async function getAdminOrder(code: string) {
  const [row] = await sql<AdminOrderRow[]>`${selectWithItems} WHERE o.code = ${code} GROUP BY o.id`;
  return row ?? null;
}
