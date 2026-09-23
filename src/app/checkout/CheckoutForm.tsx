"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, Loader2, MapPin, Smartphone, Store, Truck, Wallet } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { cedis } from "@/lib/format";
import { site } from "@/lib/site";
import { placeOrder } from "./actions";

export function CheckoutForm() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cash">("momo");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-sand">
        <p className="font-display text-2xl text-forest">Your basket is empty.</p>
        <Link href="/#shop" className="mt-5 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-cream">
          Go shopping
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        customerName: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""),
        note: String(form.get("note") ?? ""),
        fulfilment,
        paymentMethod,
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      });
      if (result.ok) {
        clear();
        router.push(`/order/${result.code}`);
      } else {
        setError(result.error);
      }
    });
  }

  const input =
    "mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3 md:space-y-8">
        {/* Phones: collapsible summary at the top */}
        <details className="group rounded-2xl bg-forest text-cream lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              Order summary · {items.reduce((n, i) => n + i.quantity, 0)} items
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </span>
            <span className="font-display text-base">{cedis(subtotal)}</span>
          </summary>
          <ul className="space-y-2 border-t border-cream/15 px-4 py-3 text-sm">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3">
                <span className="text-cream/85">{i.quantity} × {i.name}</span>
                <span className="whitespace-nowrap font-semibold">{cedis(i.quantity * i.pricePesewas)}</span>
              </li>
            ))}
          </ul>
        </details>

        <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-sand sm:p-8 md:rounded-3xl">
          <legend className="sr-only">Your details</legend>
          <h2 className="font-display text-lg font-semibold text-forest md:text-2xl">Your details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:mt-5 md:gap-4">
            <label className="text-sm font-semibold">
              Full name
              <input name="name" required minLength={2} autoComplete="name" className={input} />
            </label>
            <label className="text-sm font-semibold">
              Phone (WhatsApp preferred)
              <input name="phone" required type="tel" autoComplete="tel" placeholder="024 000 0000" className={input} />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-sand sm:p-8 md:rounded-3xl">
          <legend className="sr-only">Pickup or delivery</legend>
          <h2 className="font-display text-lg font-semibold text-forest md:text-2xl">Pickup or delivery?</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 md:mt-5 md:gap-3">
            <Choice checked={fulfilment === "pickup"} onSelect={() => setFulfilment("pickup")} icon={Store} title="Pickup — free" text={`${site.address.line1}, Mon–Thu 9–5`} />
            <Choice checked={fulfilment === "delivery"} onSelect={() => setFulfilment("delivery")} icon={Truck} title="Delivery" text="Fee confirmed on WhatsApp" />
          </div>
          {fulfilment === "delivery" ? (
            <label className="mt-3 block text-sm font-semibold md:mt-5">
              Delivery address / landmark
              <textarea name="address" required rows={2} className={input} placeholder="e.g. Kasoa, near the Total filling station" />
            </label>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted md:mt-4 md:text-sm">
              <MapPin className="h-4 w-4 text-cayenne" /> {site.address.line1}, {site.address.line2}, {site.address.city}
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-sand sm:p-8 md:rounded-3xl">
          <legend className="sr-only">Payment</legend>
          <h2 className="font-display text-lg font-semibold text-forest md:text-2xl">Payment</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 md:mt-5 md:gap-3">
            <Choice checked={paymentMethod === "momo"} onSelect={() => setPaymentMethod("momo")} icon={Smartphone} title="Mobile Money" text={`${site.momo.network} · ${site.momo.number}`} />
            <Choice checked={paymentMethod === "cash"} onSelect={() => setPaymentMethod("cash")} icon={Wallet} title="Cash" text="Pay when you pick up / receive" />
          </div>
          <label className="mt-3 block text-sm font-semibold md:mt-5">
            Note (optional)
            <textarea name="note" rows={2} maxLength={500} className={input} placeholder="Anything we should know?" />
          </label>
        </fieldset>
      </div>

      <aside className="hidden h-fit rounded-3xl bg-forest p-8 text-cream lg:sticky lg:top-24 lg:block">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {items.map((i) => (
            <li key={i.slug} className="flex items-center gap-3">
              <ProductImage src={i.image} name={i.name} category={i.category} className="h-14 w-14 shrink-0 rounded-xl" sizes="56px" label={false} />
              <div className="flex-1 text-sm">
                <p className="font-semibold">{i.name}</p>
                <p className="text-cream/65">
                  {i.quantity} × {cedis(i.pricePesewas)}
                </p>
              </div>
              <span className="text-sm font-semibold">{cedis(i.quantity * i.pricePesewas)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-cream/15 pt-5 text-lg">
          <span>Subtotal</span>
          <span className="font-display font-semibold">{cedis(subtotal)}</span>
        </div>
        {fulfilment === "delivery" && <p className="mt-1 text-xs text-cream/65">+ delivery fee, confirmed on WhatsApp</p>}
        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-cayenne/90 px-4 py-3 text-sm font-medium text-white">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-kente py-3.5 font-semibold text-forest-deep hover:brightness-105 disabled:opacity-70"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Place order
        </button>
        <p className="mt-3 text-center text-xs text-cream/60">We&apos;ll confirm your order by phone or WhatsApp.</p>
      </aside>

      {/* Phones: app-style fixed pay bar */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-paper/95 px-4 pt-3 backdrop-blur lg:hidden">
        {error && (
          <p role="alert" className="mb-2 rounded-xl bg-cayenne/90 px-3 py-2 text-xs font-medium text-white">
            {error}
          </p>
        )}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted">Total{fulfilment === "delivery" ? " + delivery" : ""}</p>
            <p className="font-display text-xl font-semibold text-forest">{cedis(subtotal)}</p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-full bg-forest px-7 py-3.5 font-semibold text-cream disabled:opacity-70"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Place order
          </button>
        </div>
      </div>
    </form>
  );
}

function Choice({
  checked,
  onSelect,
  icon: Icon,
  title,
  text,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex items-start gap-2 rounded-xl border-2 p-3 text-left transition md:gap-3 md:rounded-2xl md:p-4 ${
        checked ? "border-leaf bg-leaf/5" : "border-sand hover:border-leaf/40"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? "text-leaf-dark" : "text-muted"}`} />
      <span>
        <span className="block text-sm font-semibold text-forest md:text-base">{title}</span>
        <span className="block text-xs text-muted md:text-sm">{text}</span>
      </span>
    </button>
  );
}
