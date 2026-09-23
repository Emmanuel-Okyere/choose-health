"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

const statuses = ["new", "paid", "ready", "completed", "cancelled"] as const;

export async function updateOrderStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !statuses.includes(status as (typeof statuses)[number])) return;
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
  revalidatePath("/admin");
}
