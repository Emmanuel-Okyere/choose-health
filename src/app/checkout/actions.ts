"use server";

import { randomInt } from "node:crypto";
import { sql } from "@/lib/db";

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  fulfilment: "pickup" | "delivery";
  address?: string;
  paymentMethod: "momo" | "cash";
  note?: string;
  items: { slug: string; quantity: number }[];
};

export type PlaceOrderResult = { ok: true; code: string } | { ok: false; error: string };

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L confusion

class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Not enough stock for ${productName}`);
  }
}

function newOrderCode() {
  let s = "";
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `NH-${s}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const name = input.customerName?.trim() ?? "";
  const phone = input.phone?.replace(/[^\d+]/g, "") ?? "";
  const address = input.address?.trim() || null;
  const note = input.note?.trim().slice(0, 500) || null;

  if (name.length < 2 || name.length > 80) return { ok: false, error: "Please enter your full name." };
  if (!/^\+?\d{9,15}$/.test(phone)) return { ok: false, error: "Please enter a valid phone number." };
  if (input.fulfilment !== "pickup" && input.fulfilment !== "delivery")
    return { ok: false, error: "Choose pickup or delivery." };
  if (input.fulfilment === "delivery" && (!address || address.length < 5))
    return { ok: false, error: "Please enter a delivery address or landmark." };
  if (input.paymentMethod !== "momo" && input.paymentMethod !== "cash")
    return { ok: false, error: "Choose a payment method." };

  const wanted = new Map<string, number>();
  for (const item of input.items ?? []) {
    const qty = Math.floor(Number(item.quantity));
    if (typeof item.slug === "string" && qty > 0 && qty <= 99) wanted.set(item.slug, qty);
  }
  if (wanted.size === 0) return { ok: false, error: "Your basket is empty." };

  // Prices always come from the database, never from the browser.
  const products = await sql<{ id: number; slug: string; name: string; size: string | null; pricePesewas: number }[]>`
    SELECT id, slug, name, size, price_pesewas FROM products
    WHERE slug IN ${sql([...wanted.keys()])} AND in_stock AND is_active`;
  if (products.length !== wanted.size)
    return { ok: false, error: "Some items are no longer available. Please refresh and try again." };

  const lines = products.map((p) => ({
    productId: p.id,
    name: p.size ? `${p.name} (${p.size})` : p.name,
    unitPricePesewas: p.pricePesewas,
    quantity: wanted.get(p.slug)!,
  }));
  const subtotal = lines.reduce((n, l) => n + l.unitPricePesewas * l.quantity, 0);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newOrderCode();
    try {
      await sql.begin(async (tx) => {
        const [order] = await tx<{ id: number }[]>`
          INSERT INTO orders (code, customer_name, phone, fulfilment, address, payment_method, note, subtotal_pesewas)
          VALUES (${code}, ${name}, ${phone}, ${input.fulfilment}, ${address}, ${input.paymentMethod}, ${note}, ${subtotal})
          RETURNING id`;
        await tx`
          INSERT INTO order_items ${tx(
            lines.map((l) => ({
              order_id: order.id,
              product_id: l.productId,
              name: l.name,
              unit_price_pesewas: l.unitPricePesewas,
              quantity: l.quantity,
            })),
          )}`;
        // Take counted stock down. The WHERE clause makes this safe when two people buy the last one at once.
        for (const l of lines) {
          const updated = await tx`
            UPDATE products SET stock_quantity = stock_quantity - ${l.quantity}
            WHERE id = ${l.productId} AND (stock_quantity IS NULL OR stock_quantity >= ${l.quantity})`;
          if (updated.count === 0) throw new OutOfStockError(l.name);
        }
      });
      return { ok: true, code };
    } catch (err) {
      if (err instanceof OutOfStockError) {
        return { ok: false, error: `Sorry, we don't have enough ${err.productName} left. Please reduce the quantity or remove it.` };
      }
      if ((err as { code?: string }).code === "23505") continue; // order code collision, retry
      console.error("placeOrder failed", err);
      return { ok: false, error: "Something went wrong saving your order. Please try again or order on WhatsApp." };
    }
  }
  return { ok: false, error: "Could not create an order number. Please try again." };
}
