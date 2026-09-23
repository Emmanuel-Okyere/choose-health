import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Add product", robots: { index: false } };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-dark">
        <ArrowLeft className="h-4 w-4" /> All products
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest md:text-4xl">Add product</h1>
        <p className="mt-1 text-sm text-muted">You can add photos on the next screen.</p>
      </div>
      <ProductForm />
    </div>
  );
}
