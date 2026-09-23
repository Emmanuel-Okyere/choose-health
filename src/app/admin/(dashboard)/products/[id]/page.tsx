import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { getAdminProduct } from "@/lib/admin-products";
import { orderDate } from "@/lib/format";
import { ProductForm } from "../ProductForm";
import { ProductImages } from "../ProductImages";
import { DeleteProductButton } from "../DeleteProductButton";
import { StockBadge } from "../StockBadge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product", robots: { index: false } };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const me = await requireAdmin();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const product = await getAdminProduct(Number(id));
  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-dark">
        <ArrowLeft className="h-4 w-4" /> All products
      </Link>

      {sp.created && (
        <p className="flex items-center gap-2 rounded-2xl bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf-dark">
          <CheckCircle2 className="h-5 w-5" /> Product created. Now add some photos.
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest md:text-4xl">{product.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <StockBadge inStock={product.inStock} quantity={product.stockQuantity} />
            <span>· {product.soldCount} sold</span>
            <span>· Updated {orderDate(product.updatedAt)}</span>
            {!product.isActive && <span className="font-semibold">· Hidden from shop</span>}
          </p>
        </div>
        {product.isActive && (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-sm font-semibold text-forest hover:bg-sand"
          >
            View in shop <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>

      <ProductImages productId={product.id} imageIds={product.imageIds} />
      <ProductForm product={product} />

      <section className="rounded-2xl border border-cayenne/20 p-4 md:p-6">
        <h2 className="font-semibold text-forest">Remove this product</h2>
        {me.role === "super_admin" ? (
          <div className="mt-3">
            <DeleteProductButton id={product.id} name={product.name} />
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Only super admins can delete products. You can hide it instead by unticking &quot;Show in the shop&quot;.
          </p>
        )}
      </section>
    </div>
  );
}
