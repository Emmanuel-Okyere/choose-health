"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import { WhatsAppIcon } from "./WhatsAppFab";
import { whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/queries";

export function ProductPurchase({ product: p }: { product: Product }) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.slug === p.slug)?.quantity ?? 0;
  const max = Math.max(0, Math.min(99, (p.stockQuantity ?? 99) - inCart));

  function addToCart() {
    add(
      {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        size: p.size,
        pricePesewas: p.pricePesewas,
        image: p.image,
        category: p.category,
      },
      qty,
    );
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1600);
  }

  const ask = whatsappLink(`Hello, I have a question about ${p.name}${p.size ? ` (${p.size})` : ""}.`);

  return (
    <div className="space-y-3">
      {p.inStock ? (
        <div className="flex gap-3">
          <div className="flex items-center rounded-full border border-sand bg-white">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="p-3 disabled:opacity-30" aria-label="Fewer">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} className="p-3 disabled:opacity-30" aria-label="More">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={max === 0}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
              added ? "bg-leaf text-white" : "bg-forest text-cream hover:bg-forest-deep"
            }`}
          >
            {added ? <Check className="h-5 w-5" /> : <ShoppingBasket className="h-5 w-5" />}
            {added ? "Added to basket" : max === 0 ? "All in your basket" : "Add to basket"}
          </button>
        </div>
      ) : (
        <p className="rounded-2xl bg-cayenne/10 px-4 py-3 text-sm font-semibold text-cayenne">
          Sold out for now. Message us and we&apos;ll tell you when it&apos;s back.
        </p>
      )}
      <a
        href={ask}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full border border-forest/15 bg-white px-6 py-3 text-sm font-semibold text-forest hover:border-forest/40"
      >
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Ask about this product
      </a>
    </div>
  );
}
