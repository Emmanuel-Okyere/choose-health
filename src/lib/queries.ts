import "server-only";
import { sql } from "./db";

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  description: string;
  size: string | null;
  category: string;
  pricePesewas: number;
  image: string | null;
  badge: string | null;
  inStock: boolean;
  wholesale: boolean;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  readMinutes: number;
  publishedAt: Date;
};

export type OrderStatus = "new" | "paid" | "ready" | "completed" | "cancelled";

export type Order = {
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
  items: { name: string; unitPricePesewas: number; quantity: number }[];
};

export async function getProducts() {
  return sql<Product[]>`
    SELECT id, slug, name, brand, description, size, category, price_pesewas, image,
           badge, in_stock, wholesale
    FROM products ORDER BY sort_order, id`;
}

export async function getPosts() {
  return sql<Post[]>`SELECT * FROM posts ORDER BY published_at DESC`;
}

export async function getPost(slug: string) {
  const [post] = await sql<Post[]>`SELECT * FROM posts WHERE slug = ${slug}`;
  return post ?? null;
}

const orderSelect = sql`
  SELECT o.*, COALESCE(
    json_agg(json_build_object('name', i.name, 'unitPricePesewas', i.unit_price_pesewas,
                               'quantity', i.quantity) ORDER BY i.id)
      FILTER (WHERE i.id IS NOT NULL), '[]') AS items
  FROM orders o LEFT JOIN order_items i ON i.order_id = o.id`;

export async function getOrder(code: string) {
  const [order] = await sql<Order[]>`${orderSelect} WHERE o.code = ${code} GROUP BY o.id`;
  return order ?? null;
}

export async function getRecentOrders(limit = 100) {
  return sql<Order[]>`${orderSelect} GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${limit}`;
}
