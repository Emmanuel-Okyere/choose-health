"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import { ProductImage } from "./ProductImage";
import { cedis } from "@/lib/format";
import type { Product } from "@/lib/queries";

const filters = [
  { key: "all", label: "All products" },
  { key: "spices", label: "Spices" },
  { key: "detox", label: "Detox" },
  { key: "balms", label: "Balms & rubs" },
  { key: "nuts-seeds", label: "Nuts & seeds" },
];

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter products">
        {filters.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? "border-forest bg-forest text-cream"
                : "border-forest/20 bg-white text-forest hover:border-forest/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {visible.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}

function ProductCard({ product: p }: { product: Product }) {
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
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_1px_0_rgb(0_0_0/0.03)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <ProductImage src={p.image} name={p.name} category={p.category} className="aspect-[4/3] w-full" sizes="(max-width: 640px) 100vw, 25vw" />
        {p.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider ${
              p.badge === "Restocked" ? "bg-cayenne text-white" : "bg-kente text-forest-deep"
            }`}
          >
            {p.badge === "Restocked" ? "🔥 Restocked" : p.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-leaf-dark">
          {[p.brand, p.size].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-forest">{p.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
          <span className="whitespace-nowrap font-display text-xl font-semibold">{cedis(p.pricePesewas)}</span>
          <button
            onClick={handleAdd}
            disabled={!p.inStock}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              added ? "bg-leaf text-white" : "bg-forest text-cream hover:bg-forest-deep"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {!p.inStock ? "Sold out" : added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
