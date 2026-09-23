"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/lib/queries";
import { updateOrderStatus } from "../actions";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  paid: "Paid",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-kente/25 text-forest-deep ring-kente/40",
  paid: "bg-leaf/15 text-leaf-dark ring-leaf/30",
  ready: "bg-sky-100 text-sky-800 ring-sky-200",
  completed: "bg-sand text-muted ring-sand",
  cancelled: "bg-cayenne/10 text-cayenne ring-cayenne/25",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Changes status as soon as a new value is picked. */
export function StatusSelect({ id, status, compact = false }: { id: number; status: OrderStatus; compact?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      <select
        key={status}
        defaultValue={status}
        disabled={pending}
        aria-label="Order status"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const fd = new FormData();
          fd.set("id", String(id));
          fd.set("status", e.target.value);
          start(() => updateOrderStatus(fd));
        }}
        className={`rounded-lg border-0 font-semibold ring-1 ${STATUS_STYLE[status]} ${compact ? "py-1 pl-2.5 pr-7 text-xs" : "py-2 pl-3 pr-8 text-sm"}`}
      >
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
    </span>
  );
}
