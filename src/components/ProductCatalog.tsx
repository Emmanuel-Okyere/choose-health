"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Flame, Nut, Plus } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import { ProductImage } from "./ProductImage";
import { cedis } from "@/lib/format";
import type { Product } from "@/lib/queries";
import { CATEGORIES } from "@/lib/categories";

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");
  // Only show categories that currently have products.
  const filters = [{ key: "all", label: "All" }, ...CATEGORIES.filter((c) => products.some((p) => p.category === c.key))];
  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <>
      {/* Sticks under the header on phones, like an app's category bar */}
      <div className="sticky top-[49px] z-30 -mx-4 mb-4 bg-paper/95 px-4 py-2.5 backdrop-blur md:static md:mx-0 md:mb-8 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter products">
          {filters.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition md:px-4 md:py-2 md:text-sm ${
                filter === f.key
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/20 bg-white text-forest hover:border-forest/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 min-[360px]:gap-3 sm:gap-5 lg:grid-cols-4">
        {visible.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      size: p.size,
      pricePesewas: p.pricePesewas,
      image: p.image,
      category: p.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:rounded-3xl">
      <Link href={`/products/${p.slug}`} className="relative block" aria-label={`${p.name}, view details`}>
        <ProductImage
          src={p.image}
          name={p.name}
          category={p.category}
          className="aspect-square w-full sm:aspect-[4/3]"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {p.badge && (
          <span
            className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[0.7rem] ${
              p.badge === "Restocked" ? "bg-cayenne text-white" : "bg-kente text-forest-deep"
            }`}
          >
            {p.badge === "Restocked" ? (
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            ) : p.wholesale ? (
              <Nut className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            ) : null}
            {p.badge}
          </span>
        )}
        {!p.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-forest-deep/75 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-2.5 min-[360px]:p-3 sm:p-5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-leaf-dark sm:text-xs">
          {[p.brand, p.size].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-forest sm:mt-1 sm:text-xl">
          <Link href={`/products/${p.slug}`} className="hover:underline">
            {p.name}
          </Link>
        </h3>
        <p className="mt-2 hidden text-sm leading-relaxed text-muted sm:line-clamp-3">{p.description}</p>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-2 min-[360px]:gap-2 sm:pt-5 lg:flex-col lg:items-stretch lg:gap-3">
          <span className="whitespace-nowrap font-display text-[15px] font-semibold min-[360px]:text-base sm:text-xl">{cedis(p.pricePesewas)}</span>
          <button
            onClick={handleAdd}
            disabled={!p.inStock}
            aria-label={p.inStock ? `Add ${p.name} to cart` : `${p.name} is sold out`}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 min-[360px]:h-9 min-[360px]:w-9 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-2 lg:w-full lg:py-2.5 ${
              added ? "bg-leaf text-white" : "bg-forest text-cream hover:bg-forest-deep"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">{!p.inStock ? "Sold out" : added ? "Added" : "Add to cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
