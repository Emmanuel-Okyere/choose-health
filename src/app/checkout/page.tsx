import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="paper-grain flex-1">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="mb-10 font-display text-5xl font-semibold tracking-tight text-forest">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}
