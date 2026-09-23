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
  image: string | null; // main photo URL
  badge: string | null;
  inStock: boolean; // false when switched off or the counted stock has run out
  stockQuantity: number | null; // null = not counted
  wholesale: boolean;
};

export type ProductDetail = Product & { details: string | null; images: string[] };

export const imageUrl = (id: number) => `/media/${id}`;

// Main photo: the first uploaded photo, else the legacy static path on the product row.
const productColumns = sql`
  p.id, p.slug, p.name, p.brand, p.description, p.size, p.category, p.price_pesewas, p.badge,
  p.wholesale, p.stock_quantity,
  (p.in_stock AND (p.stock_quantity IS NULL OR p.stock_quantity > 0)) AS in_stock,
  COALESCE((SELECT '/media/' || i.id FROM product_images i WHERE i.product_id = p.id
            ORDER BY i.sort_order, i.id LIMIT 1), p.image) AS image`;

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
    SELECT ${productColumns} FROM products p WHERE p.is_active ORDER BY p.sort_order, p.id`;
}

export async function getProductBySlug(slug: string) {
  const [product] = await sql<(Product & { details: string | null; imageIds: number[] })[]>`
    SELECT ${productColumns}, p.details,
      COALESCE((SELECT array_agg(i.id ORDER BY i.sort_order, i.id) FROM product_images i WHERE i.product_id = p.id), '{}') AS image_ids
    FROM products p WHERE p.slug = ${slug} AND p.is_active`;
  if (!product) return null;
  const { imageIds, ...rest } = product;
  const images = imageIds.length ? imageIds.map(imageUrl) : product.image ? [product.image] : [];
  return { ...rest, images } satisfies ProductDetail;
}

export async function getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 4) {
  return sql<Product[]>`
    SELECT ${productColumns} FROM products p
    WHERE p.is_active AND p.id <> ${product.id}
    ORDER BY (p.category = ${product.category}) DESC, p.sort_order, p.id LIMIT ${limit}`;
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
