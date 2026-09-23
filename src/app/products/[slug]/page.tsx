import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Flame, MapPin, Nut, Smartphone, Truck } from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductCard } from "@/components/ProductCatalog";
import { Prose } from "@/components/Prose";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { categoryLabel } from "@/lib/categories";
import { cedis } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const title = [p.name, p.size].filter(Boolean).join(" ");
  return {
    title,
    description: `${p.description} ${cedis(p.pricePesewas)} at ${site.name}, Awoshie, Accra.`,
    openGraph: { title, description: p.description, images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  const stockNote = !product.inStock
    ? null
    : product.stockQuantity !== null && product.stockQuantity <= 5
      ? `Only ${product.stockQuantity} left`
      : "In stock";

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted md:mb-6 md:text-sm">
          <Link href="/#shop" className="hover:text-forest">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{categoryLabel(product.category)}</span>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <ProductGallery images={product.images} name={product.name} category={product.category} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.badge && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    product.badge === "Restocked" ? "bg-cayenne text-white" : "bg-kente text-forest-deep"
                  }`}
                >
                  {product.badge === "Restocked" ? <Flame className="h-3.5 w-3.5" /> : product.wholesale ? <Nut className="h-3.5 w-3.5" /> : null}
                  {product.badge}
                </span>
              )}
              {stockNote && (
                <span className={`text-xs font-semibold ${stockNote === "In stock" ? "text-leaf-dark" : "text-cayenne"}`}>{stockNote}</span>
              )}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-leaf-dark">
              {[product.brand, product.size].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-forest md:text-5xl">{product.name}</h1>
            <p className="mt-3 font-display text-2xl font-semibold md:text-3xl">{cedis(product.pricePesewas)}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80 md:text-lg">{product.description}</p>

            <div className="mt-6">
              <ProductPurchase product={product} />
            </div>

            <ul className="mt-6 grid gap-2.5 rounded-2xl bg-cream p-4 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-cayenne" /> Pickup at {site.address.line1}, Mon-Thu 9am-5pm
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0 text-cayenne" /> Delivery available, fee agreed on WhatsApp
              </li>
              <li className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 shrink-0 text-cayenne" /> Pay with MTN MoMo or cash
              </li>
              {product.wholesale && (
                <li className="flex items-center gap-2.5">
                  <Nut className="h-4 w-4 shrink-0 text-cayenne" /> Wholesale prices available on request
                </li>
              )}
            </ul>

            {product.details && (
              <section className="mt-8">
                <h2 className="mb-3 font-display text-xl font-semibold text-forest md:text-2xl">Details</h2>
                <Prose body={product.details} />
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12 md:mt-20">
            <h2 className="mb-4 font-display text-2xl font-semibold text-forest md:mb-6 md:text-3xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-2 min-[360px]:gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
