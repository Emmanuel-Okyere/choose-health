"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { BADGES, CATEGORIES } from "@/lib/categories";
import type { AdminProduct } from "@/lib/admin-products";
import { saveProduct, type ProductFormState } from "./actions";

const field =
  "mt-1.5 w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const p = product;

  return (
    // Submitted manually so React doesn't clear the fields when the server returns a validation error.
    // key: remount with the saved values after a successful save.
    <form
      key={p ? String(p.updatedAt) : "new"}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-5"
    >
      {p && <input type="hidden" name="id" value={p.id} />}

      <section className="rounded-2xl bg-white p-4 ring-1 ring-sand md:p-6">
        <h2 className="font-display text-lg font-semibold text-forest md:text-xl">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Product name
            <input name="name" required minLength={2} maxLength={80} defaultValue={p?.name} placeholder="Cayenne Pepper" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Brand <span className="font-normal text-muted">(optional)</span>
            <input name="brand" maxLength={60} defaultValue={p?.brand ?? ""} placeholder="Badia" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Size <span className="font-normal text-muted">(optional)</span>
            <input name="size" maxLength={40} defaultValue={p?.size ?? ""} placeholder="113.4g" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Category
            <select name="category" required defaultValue={p?.category ?? "spices"} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Badge <span className="font-normal text-muted">(optional)</span>
            <select name="badge" defaultValue={p?.badge ?? ""} className={field}>
              <option value="">None</option>
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Short description <span className="font-normal text-muted">(shown on the product card)</span>
            <textarea name="description" required minLength={5} maxLength={300} rows={2} defaultValue={p?.description} className={field} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Full details <span className="font-normal text-muted">(optional, shown on the product page)</span>
            <textarea
              name="details"
              maxLength={5000}
              rows={5}
              defaultValue={p?.details ?? ""}
              placeholder={"How to use it, ingredients, storage...\n\nLeave a blank line between paragraphs."}
              className={field}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-sand md:p-6">
        <h2 className="font-display text-lg font-semibold text-forest md:text-xl">Price and stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Price (GH₵)
            <input
              name="price"
              required
              inputMode="decimal"
              pattern="[0-9.,]+"
              defaultValue={p ? (p.pricePesewas / 100).toFixed(2) : ""}
              placeholder="45.00"
              className={field}
            />
          </label>
          <label className="text-sm font-semibold">
            Stock count <span className="font-normal text-muted">(optional)</span>
            <input
              name="stockQuantity"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={p?.stockQuantity ?? ""}
              placeholder="Leave empty if you don't count"
              className={field}
            />
            <span className="mt-1 block text-xs font-normal text-muted">Goes down when orders come in. At 0 the product shows as sold out.</span>
          </label>
        </div>
        <div className="mt-5 space-y-3">
          <Check name="inStock" defaultChecked={p?.inStock ?? true} title="In stock" text="Untick to mark it sold out without hiding it." />
          <Check name="isActive" defaultChecked={p?.isActive ?? true} title="Show in the shop" text="Untick to hide it from customers." />
          <Check name="wholesale" defaultChecked={p?.wholesale ?? false} title="Available wholesale" text="Customers can ask for bulk prices." />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-cream hover:bg-forest-deep disabled:opacity-70"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} {p ? "Save changes" : "Create product"}
        </button>
        {state.error && <p role="alert" className="text-sm font-medium text-cayenne">{state.error}</p>}
        {state.success && <p role="status" className="text-sm font-medium text-leaf-dark">{state.success}</p>}
      </div>
    </form>
  );
}

function Check({ name, defaultChecked, title, text }: { name: string; defaultChecked: boolean; title: string; text: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 rounded accent-[#2f7a3c]" />
      <span>
        <span className="block text-sm font-semibold text-forest">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </label>
  );
}
