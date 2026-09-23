import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="paper-grain flex-1">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-14">
        <h1 className="mb-4 font-display text-3xl font-semibold tracking-tight text-forest md:mb-10 md:text-5xl">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}
