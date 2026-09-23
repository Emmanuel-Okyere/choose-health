import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, PackagePlus, Pencil, Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { listAdminProducts, productStats } from "@/lib/admin-products";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { cedis } from "@/lib/format";
import { imageUrl } from "@/lib/queries";
import { ProductToggle } from "./ProductToggle";
import { StockBadge } from "./StockBadge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products", robots: { index: false } };

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const category = typeof sp.category === "string" && CATEGORIES.some((c) => c.key === sp.category) ? sp.category : "";
  const [products, stats] = await Promise.all([listAdminProducts({ q, category }), productStats()]);

  const input =
    "w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-forest md:text-4xl">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep">
          <PackagePlus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Products", value: stats.total },
          { label: "Showing in shop", value: stats.visible },
          { label: "Low stock (5 or fewer)", value: stats.lowStock, accent: stats.lowStock > 0 },
          { label: "Sold out", value: stats.soldOut, warn: stats.soldOut > 0 },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl p-4 ring-1 ${c.warn ? "bg-cayenne/5 ring-cayenne/25" : c.accent ? "bg-kente/15 ring-kente/40" : "bg-white ring-sand"}`}
          >
            <p className="text-xs font-semibold text-muted">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-forest">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
        <form action="/admin/products" className="grid gap-3 border-b border-sand bg-paper/60 p-4 sm:grid-cols-[2fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q} placeholder="Search by name or brand" className={`${input} pl-9`} />
          </label>
          <select name="category" defaultValue={category} aria-label="Category" className={input}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep">Filter</button>
        </form>

        {products.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">No products found.</p>
        ) : (
          <ul className="divide-y divide-sand">
            <li className="hidden grid-cols-[3.5rem_1fr_7rem_7rem_7rem_5rem_5rem_2.5rem] items-center gap-4 bg-paper/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
              <span />
              <span>Product</span>
              <span>Category</span>
              <span className="text-right">Price</span>
              <span>Stock</span>
              <span>In stock</span>
              <span>Visible</span>
              <span />
            </li>
            {products.map((p) => (
              <li
                key={p.id}
                className={`grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[3.5rem_1fr_7rem_7rem_7rem_5rem_5rem_2.5rem] md:gap-4 ${
                  p.isActive ? "" : "bg-paper/70"
                }`}
              >
                <Link href={`/admin/products/${p.id}`} className="relative h-14 w-14 overflow-hidden rounded-xl bg-cream ring-1 ring-sand">
                  {p.imageIds[0] ? (
                    <Image src={imageUrl(p.imageIds[0])} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <ImageOff className="absolute inset-0 m-auto h-5 w-5 text-muted" />
                  )}
                </Link>
                <Link href={`/admin/products/${p.id}`} className="min-w-0">
                  <p className={`truncate font-semibold ${p.isActive ? "text-forest" : "text-muted line-through decoration-1"}`}>{p.name}</p>
                  <p className="truncate text-xs text-muted">
                    {[p.brand, p.size].filter(Boolean).join(" · ") || "No brand or size"}
                    {p.imageIds.length > 1 && ` · ${p.imageIds.length} photos`}
                  </p>
                  {/* phone summary */}
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 md:hidden">
                    <span className="text-sm font-semibold">{cedis(p.pricePesewas)}</span>
                    <StockBadge inStock={p.inStock} quantity={p.stockQuantity} />
                    {!p.isActive && <span className="text-xs font-semibold text-muted">Hidden</span>}
                  </p>
                </Link>
                <span className="hidden text-sm text-muted md:block">{categoryLabel(p.category)}</span>
                <span className="hidden whitespace-nowrap text-right text-sm font-semibold md:block">{cedis(p.pricePesewas)}</span>
                <span className="hidden md:block">
                  <StockBadge inStock={p.inStock} quantity={p.stockQuantity} />
                </span>
                <span className="hidden md:block">
                  <ProductToggle id={p.id} flag="inStock" value={p.inStock} label={`${p.name} in stock`} />
                </span>
                <span className="hidden md:block">
                  <ProductToggle id={p.id} flag="isActive" value={p.isActive} label={`Show ${p.name} in the shop`} />
                </span>
                <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-forest hover:bg-sand">
                  <Pencil className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
