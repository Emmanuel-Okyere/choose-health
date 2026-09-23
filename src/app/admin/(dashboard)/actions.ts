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
  await sql`
    UPDATE orders SET status = ${status}, status_updated_at = now(), status_updated_by = ${me.username}
    WHERE id = ${id} AND status <> ${status}`;
  revalidatePath("/admin", "layout");
}
