import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Smartphone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import { getOrder } from "@/lib/queries";
import { cedis } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function OrderPage(props: PageProps<"/order/[code]">) {
  const { code } = await props.params;
  const order = await getOrder(code.toUpperCase());
  if (!order) notFound();

  const waMessage =
    `Hello! I just placed order ${order.code} on the website.\n` +
    order.items.map((i) => `• ${i.quantity} × ${i.name}`).join("\n") +
    `\nTotal: ${cedis(order.subtotalPesewas)}\n` +
    (order.paymentMethod === "momo" ? "I'll send the MoMo payment screenshot here." : "I'll pay cash.");

  return (
    <main className="paper-grain flex-1">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl ring-1 ring-sand sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-leaf" />
          <h1 className="mt-4 font-display text-4xl font-semibold text-forest">Medaase, {order.customerName.split(" ")[0]}!</h1>
          <p className="mt-2 text-muted">Your order has been received.</p>
          <p className="mt-6 inline-block rounded-2xl bg-cream px-6 py-3 font-display text-3xl font-semibold tracking-widest text-forest">
            {order.code}
          </p>

          <ul className="mt-8 divide-y divide-sand text-left">
            {order.items.map((i) => (
              <li key={i.name} className="flex justify-between py-3">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-semibold">{cedis(i.quantity * i.unitPricePesewas)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3 text-lg">
              <span>Total</span>
              <span className="font-display font-semibold">{cedis(order.subtotalPesewas)}</span>
            </li>
          </ul>

          {order.paymentMethod === "momo" && (
            <div className="mt-8 rounded-2xl bg-forest p-6 text-left text-cream">
              <p className="flex items-center gap-2 font-semibold text-kente">
                <Smartphone className="h-5 w-5" /> Pay with Mobile Money
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-cream/85">
                <li>
                  Send <strong className="text-white">{cedis(order.subtotalPesewas)}</strong> to{" "}
                  <strong className="text-white">{site.momo.number}</strong> ({site.momo.accountName}).
                </li>
                <li>
                  Use <strong className="text-white">{order.code}</strong> as the reference.
                </li>
                <li>Send us the payment screenshot on WhatsApp.</li>
              </ol>
            </div>
          )}

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 text-cayenne" />
            {order.fulfilment === "pickup"
              ? `Pickup: ${site.address.line1}, ${site.address.line2} · Mon–Thu 9–5`
              : `Delivery to: ${order.address}`}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white"
            >
              <WhatsAppIcon /> Confirm on WhatsApp
            </a>
            <Link href="/" className="rounded-full border border-forest/20 px-6 py-3 font-semibold text-forest hover:bg-sand">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
