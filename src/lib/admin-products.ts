import "server-only";
import { sql } from "./db";

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  description: string;
  details: string | null;
  size: string | null;
  category: string;
  pricePesewas: number;
  badge: string | null;
  inStock: boolean; // the on/off switch (counted stock can still be 0)
  stockQuantity: number | null;
  wholesale: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: Date;
  imageIds: number[];
  soldCount: number;
};

const columns = sql`
  p.id, p.slug, p.name, p.brand, p.description, p.details, p.size, p.category, p.price_pesewas, p.badge,
  p.in_stock, p.stock_quantity, p.wholesale, p.is_active, p.sort_order, p.updated_at,
  COALESCE((SELECT array_agg(i.id ORDER BY i.sort_order, i.id) FROM product_images i WHERE i.product_id = p.id), '{}') AS image_ids,
  COALESCE((SELECT sum(oi.quantity) FROM order_items oi JOIN orders o ON o.id = oi.order_id
            WHERE oi.product_id = p.id AND o.status <> 'cancelled'), 0)::int AS sold_count`;

export async function listAdminProducts({ q = "", category = "" } = {}) {
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  return sql<AdminProduct[]>`
    SELECT ${columns} FROM products p
    WHERE (${q} = '' OR p.name ILIKE ${like} OR p.brand ILIKE ${like})
      AND (${category} = '' OR p.category = ${category})
    ORDER BY p.is_active DESC, p.sort_order, p.id`;
}

export async function getAdminProduct(id: number) {
  const [row] = await sql<AdminProduct[]>`SELECT ${columns} FROM products p WHERE p.id = ${id}`;
  return row ?? null;
}

export async function productStats() {
  const [s] = await sql<{ total: number; visible: number; soldOut: number; lowStock: number }[]>`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE is_active)::int AS visible,
      count(*) FILTER (WHERE is_active AND (NOT in_stock OR stock_quantity = 0))::int AS sold_out,
      count(*) FILTER (WHERE is_active AND in_stock AND stock_quantity BETWEEN 1 AND 5)::int AS low_stock
    FROM products`;
  return s;
}
