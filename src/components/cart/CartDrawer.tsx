"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { ProductImage } from "../ProductImage";
import { cedis } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export function CartDrawer() {
  const { items, subtotal, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const waMessage =
    "Hello Natural Health Retreat, I'd like to order:\n" +
    items.map((i) => `• ${i.quantity} × ${i.name}${i.size ? ` (${i.size})` : ""}`).join("\n") +
    `\nSubtotal: ${cedis(subtotal)}`;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-forest-deep/50 backdrop-blur-[2px] transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-paper shadow-2xl transition-transform duration-300 md:inset-x-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none ${
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        {/* Grab handle (phones) */}
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-sand" />
        </div>
        <header className="flex items-center justify-between border-b border-sand px-5 py-3 md:px-6 md:py-5">
          <h2 className="font-display text-xl font-semibold text-forest md:text-2xl">Your basket</h2>
          <button onClick={close} className="rounded-full p-2 hover:bg-sand" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-10 text-center">
            <ShoppingBag className="h-12 w-12 text-leaf" />
            <p className="text-muted">Your basket is empty. Our restocked spices are waiting!</p>
            <Link href="/#shop" onClick={close} className="rounded-full bg-forest px-5 py-2.5 font-semibold text-cream">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand overflow-y-auto overscroll-contain px-5 md:px-6">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-3 py-3 md:gap-4 md:py-4">
                  <ProductImage src={item.image} name={item.name} category={item.category} className="h-16 w-16 shrink-0 rounded-xl border border-sand md:h-20 md:w-20" sizes="80px" label={false} />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{item.name}</p>
                        <p className="text-sm text-muted">{[item.brand, item.size].filter(Boolean).join(" · ")}</p>
                      </div>
                      <button onClick={() => remove(item.slug)} className="self-start p-1 text-muted hover:text-cayenne" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-sand bg-white">
                        <button onClick={() => setQuantity(item.slug, item.quantity - 1)} className="p-2" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.slug, item.quantity + 1)} className="p-2" aria-label="Increase quantity">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold">{cedis(item.pricePesewas * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="pb-safe space-y-2.5 border-t border-sand bg-cream px-5 pt-4 md:space-y-3 md:px-6 md:py-5">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-display font-semibold">{cedis(subtotal)}</span>
              </div>
              <p className="hidden text-xs text-muted md:block">Pay with Mobile Money or cash at pickup. Delivery fee confirmed on WhatsApp.</p>
              <Link href="/checkout" onClick={close} className="block rounded-full bg-forest py-3 text-center font-semibold text-cream hover:bg-forest-deep">
                Checkout
              </Link>
              <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="mb-3 block rounded-full border border-forest py-2.5 text-center text-sm font-semibold text-forest hover:bg-sand md:mb-0 md:py-3 md:text-base">
                Or order on WhatsApp
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
