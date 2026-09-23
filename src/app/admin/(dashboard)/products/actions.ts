"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-session";
import { BADGES, CATEGORIES } from "@/lib/categories";

// Any signed-in admin can add and edit products and photos. Deleting a product is super-admin only.

export type ProductFormState = { error?: string; success?: string };

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 12;

function refresh(productId?: number, slug?: string) {
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");
  if (slug) revalidatePath(`/products/${slug}`);
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

async function uniqueSlug(base: string) {
  const taken = await sql<{ slug: string }[]>`SELECT slug FROM products WHERE slug = ${base} OR slug LIKE ${base + "-%"}`;
  const set = new Set(taken.map((t) => t.slug));
  if (!set.has(base)) return base;
  for (let n = 2; ; n++) if (!set.has(`${base}-${n}`)) return `${base}-${n}`;
}

/** "45", "45.5", "45.50", "GH₵ 1,200" -> pesewas. */
function parsePrice(raw: string) {
  const clean = raw.replace(/[^\d.]/g, "");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const name = get("name");
  const brand = get("brand") || null;
  const size = get("size") || null;
  const description = get("description");
  const details = get("details") || null;
  const category = get("category");
  const badge = get("badge") || null;
  const price = parsePrice(get("price"));
  const stockRaw = get("stockQuantity");
  const stockQuantity = stockRaw === "" ? null : Number(stockRaw);
  const inStock = formData.get("inStock") === "on";
  const wholesale = formData.get("wholesale") === "on";
  const isActive = formData.get("isActive") === "on";

  if (name.length < 2 || name.length > 80) return { error: "Enter a product name (2 to 80 characters)." };
  if (description.length < 5 || description.length > 300) return { error: "Enter a short description (5 to 300 characters)." };
  if (details && details.length > 5000) return { error: "The full details are too long (5000 characters max)." };
  if (!CATEGORIES.some((c) => c.key === category)) return { error: "Choose a category." };
  if (badge && !(BADGES as readonly string[]).includes(badge)) return { error: "Choose a valid badge." };
  if (price === null || price <= 0) return { error: "Enter a price in cedis, for example 45 or 45.50." };
  if (stockQuantity !== null && (!Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000))
    return { error: "Stock count must be a whole number, or leave it empty if you don't count stock." };
  if ((brand?.length ?? 0) > 60 || (size?.length ?? 0) > 40) return { error: "Brand or size is too long." };

  if (id) {
    const [row] = await sql<{ slug: string }[]>`
      UPDATE products SET name = ${name}, brand = ${brand}, size = ${size}, description = ${description},
        details = ${details}, category = ${category}, badge = ${badge}, price_pesewas = ${price},
        stock_quantity = ${stockQuantity}, in_stock = ${inStock}, wholesale = ${wholesale},
        is_active = ${isActive}, updated_at = now()
      WHERE id = ${id} RETURNING slug`;
    if (!row) return { error: "This product no longer exists." };
    refresh(id, row.slug);
    return { success: "Saved." };
  }

  const slug = await uniqueSlug(slugify(name));
  const [created] = await sql<{ id: number }[]>`
    INSERT INTO products (slug, name, brand, size, description, details, category, badge, price_pesewas,
                          stock_quantity, in_stock, wholesale, is_active, sort_order)
    VALUES (${slug}, ${name}, ${brand}, ${size}, ${description}, ${details}, ${category}, ${badge}, ${price},
            ${stockQuantity}, ${inStock}, ${wholesale}, ${isActive},
            (SELECT COALESCE(max(sort_order), 0) + 1 FROM products))
    RETURNING id`;
  refresh(created.id, slug);
  redirect(`/admin/products/${created.id}?created=1`);
}

/** Quick switches on the product list. */
export async function setProductFlag(id: number, flag: "inStock" | "isActive", value: boolean) {
  await requireAdmin();
  if (!Number.isInteger(id)) return;
  const [row] =
    flag === "inStock"
      ? await sql<{ slug: string }[]>`UPDATE products SET in_stock = ${value}, updated_at = now() WHERE id = ${id} RETURNING slug`
      : await sql<{ slug: string }[]>`UPDATE products SET is_active = ${value}, updated_at = now() WHERE id = ${id} RETURNING slug`;
  refresh(id, row?.slug);
}

export async function deleteProduct(id: number): Promise<ProductFormState> {
  await requireSuperAdmin();
  if (!Number.isInteger(id)) return { error: "Invalid product." };
  // Past orders keep their item names and prices (order_items.product_id is set to NULL).
  const [row] = await sql<{ slug: string }[]>`DELETE FROM products WHERE id = ${id} RETURNING slug`;
  refresh(undefined, row?.slug);
  redirect("/admin/products");
}

// ---------- Photos ----------

function detectImageType(buf: Buffer) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function uploadProductImage(formData: FormData): Promise<{ error?: string; id?: number }> {
  await requireAdmin();
  const productId = Number(formData.get("productId"));
  const file = formData.get("file");
  if (!Number.isInteger(productId) || !(file instanceof File)) return { error: "Invalid upload." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "That photo is too large (3MB max)." };

  const data = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(data); // trust the bytes, not the file name
  if (!type) return { error: "Only JPEG, PNG or WebP photos are allowed." };
  const width = Number(formData.get("width")) || null;
  const height = Number(formData.get("height")) || null;

  const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM product_images WHERE product_id = ${productId}`;
  if (count >= MAX_IMAGES) return { error: `A product can have up to ${MAX_IMAGES} photos.` };

  const [row] = await sql<{ id: number; slug: string }[]>`
    WITH ins AS (
      INSERT INTO product_images (product_id, data, content_type, byte_size, width, height, sort_order)
      SELECT ${productId}, ${data}, ${type}, ${data.length}, ${width}, ${height},
             COALESCE((SELECT max(sort_order) + 1 FROM product_images WHERE product_id = ${productId}), 0)
      WHERE EXISTS (SELECT 1 FROM products WHERE id = ${productId})
      RETURNING id)
    SELECT ins.id, p.slug FROM ins, products p WHERE p.id = ${productId}`;
  if (!row) return { error: "This product no longer exists." };
  await sql`UPDATE products SET updated_at = now(), image = NULL WHERE id = ${productId}`;
  refresh(productId, row.slug);
  return { id: row.id };
}

export async function deleteProductImage(imageId: number) {
  await requireAdmin();
  const [row] = await sql<{ productId: number }[]>`DELETE FROM product_images WHERE id = ${imageId} RETURNING product_id`;
  if (row) refresh(row.productId);
}

/** Moves a photo: "first" makes it the main photo, "left"/"right" swap it with a neighbour. */
export async function moveProductImage(imageId: number, where: "first" | "left" | "right") {
  await requireAdmin();
  const productId = await sql.begin(async (tx) => {
    const [img] = await tx<{ productId: number }[]>`SELECT product_id FROM product_images WHERE id = ${imageId}`;
    if (!img) return null;
    const ids = (
      await tx<{ id: number }[]>`
        SELECT id FROM product_images WHERE product_id = ${img.productId} ORDER BY sort_order, id FOR UPDATE`
    ).map((r) => r.id);
    const from = ids.indexOf(imageId);
    const to = where === "first" ? 0 : where === "left" ? Math.max(0, from - 1) : Math.min(ids.length - 1, from + 1);
    ids.splice(to, 0, ...ids.splice(from, 1));
    for (const [i, id] of ids.entries()) await tx`UPDATE product_images SET sort_order = ${i} WHERE id = ${id}`;
    return img.productId;
  });
  if (productId) refresh(productId);
}
