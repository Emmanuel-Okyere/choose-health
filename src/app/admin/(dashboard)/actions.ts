"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-session";
import { ORDER_STATUSES } from "@/lib/admin-orders";
import type { OrderStatus } from "@/lib/queries";

export async function updateOrderStatus(formData: FormData) {
  const me = await requireAdmin(); // server actions are reachable from any URL, so check here too
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status)) return;

  await sql.begin(async (tx) => {
    const [order] = await tx<{ status: OrderStatus }[]>`SELECT status FROM orders WHERE id = ${id} FOR UPDATE`;
    if (!order || order.status === status) return;

    // Cancelling puts counted stock back; un-cancelling takes it out again (never below zero).
    const cancelling = status === "cancelled";
    const restoring = order.status === "cancelled";
    if (cancelling || restoring) {
      await tx`
        UPDATE products p SET stock_quantity = GREATEST(0, p.stock_quantity + ${cancelling ? 1 : -1} * i.qty)
        FROM (SELECT product_id, sum(quantity)::int AS qty FROM order_items WHERE order_id = ${id} GROUP BY 1) i
        WHERE p.id = i.product_id AND p.stock_quantity IS NOT NULL`;
    }
    await tx`
      UPDATE orders SET status = ${status}, status_updated_at = now(), status_updated_by = ${me.username}
      WHERE id = ${id}`;
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}
