import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, History, MapPin, MessageSquareText, Phone, Smartphone, Store, Truck, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { getAdminOrder } from "@/lib/admin-orders";
import { cedis, orderDate } from "@/lib/format";
import { toWhatsAppNumber, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import type { OrderStatus } from "@/lib/queries";
import { StatusPill, StatusSelect } from "../StatusBits";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/admin/orders/[code]">): Promise<Metadata> {
  const { code } = await props.params;
  return { title: `Order ${code.toUpperCase()}`, robots: { index: false } };
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "new", label: "Received" },
  { status: "paid", label: "Paid" },
  { status: "ready", label: "Ready" },
  { status: "completed", label: "Completed" },
];

export default async function OrderDetailPage(props: PageProps<"/admin/orders/[code]">) {
  await requireAdmin();
  const { code } = await props.params;
  const order = await getAdminOrder(code.toUpperCase());
  if (!order) notFound();

  const firstName = order.customerName.split(" ")[0];
  const stepIndex = STEPS.findIndex((s) => s.status === order.status);
  const waTemplates = [
    { label: "Confirm order", text: `Hello ${firstName}, thank you for your order ${order.code} (${cedis(order.subtotalPesewas)}). We have received it and will get it ready for you.` },
    { label: "Payment received", text: `Hello ${firstName}, we have received your payment for order ${order.code}. Thank you!` },
    {
      label: "Ready",
      text:
        order.fulfilment === "pickup"
          ? `Hello ${firstName}, your order ${order.code} is ready for pickup at Awoshie Lane 14, near Vision School (Mon-Thu, 9am-5pm).`
          : `Hello ${firstName}, your order ${order.code} is on its way to you.`,
    },
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-dark hover:gap-2.5 transition-all">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 font-display text-4xl font-semibold tracking-wide text-forest">
            {order.code} <StatusPill status={order.status} />
          </h1>
          <p className="mt-1 text-muted">Placed {orderDate(order.createdAt)}</p>
        </div>
        <StatusSelect id={order.id} status={order.status} />
      </div>

      {/* Progress */}
      {order.status === "cancelled" ? (
        <p className="rounded-2xl bg-cayenne/10 px-5 py-3 text-sm font-semibold text-cayenne">This order was cancelled.</p>
      ) : (
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const done = i <= stepIndex;
            return (
              <li key={s.status} className="flex flex-col items-center gap-1.5 text-center">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-leaf text-white" : "bg-sand text-muted"}`}>
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-xs font-semibold ${done ? "text-forest" : "text-muted"}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Items */}
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
          <h2 className="border-b border-sand px-5 py-4 font-display text-xl font-semibold text-forest">Items</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Product</th>
                <th className="px-5 py-2.5 text-right">Price</th>
                <th className="px-5 py-2.5 text-right">Qty</th>
                <th className="px-5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {order.items.map((i, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-3 font-medium">{i.name}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-muted">{cedis(i.unitPricePesewas)}</td>
                  <td className="px-5 py-3 text-right">{i.quantity}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold">{cedis(i.unitPricePesewas * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-sand">
                <td colSpan={3} className="px-5 py-3 text-right font-semibold">Subtotal</td>
                <td className="whitespace-nowrap px-5 py-3 text-right font-display text-lg font-semibold">{cedis(order.subtotalPesewas)}</td>
              </tr>
            </tfoot>
          </table>
          {order.fulfilment === "delivery" && (
            <p className="border-t border-sand px-5 py-3 text-xs text-muted">Delivery fee is agreed with the customer on WhatsApp and is not included.</p>
          )}
        </section>

        {/* Customer */}
        <aside className="space-y-4">
          <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-sand text-sm">
            <h2 className="font-display text-xl font-semibold text-forest">{order.customerName}</h2>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted" />
              <a href={`tel:${order.phone}`} className="font-medium hover:underline">{order.phone}</a>
            </p>
            <p className="flex items-start gap-2">
              {order.fulfilment === "pickup" ? <Store className="mt-0.5 h-4 w-4 text-muted" /> : <Truck className="mt-0.5 h-4 w-4 text-muted" />}
              <span>
                {order.fulfilment === "pickup" ? "Pickup at the shop" : "Delivery"}
                {order.address && (
                  <span className="mt-0.5 flex items-start gap-1 text-muted">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.address}
                  </span>
                )}
              </span>
            </p>
            <p className="flex items-center gap-2">
              {order.paymentMethod === "momo" ? <Smartphone className="h-4 w-4 text-muted" /> : <Wallet className="h-4 w-4 text-muted" />}
              {order.paymentMethod === "momo" ? "Mobile Money" : "Cash"}
            </p>
            {order.note && (
              <p className="flex items-start gap-2 rounded-xl bg-cream p-3 italic">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 not-italic text-muted" /> {order.note}
              </p>
            )}
            {order.statusUpdatedAt && (
              <p className="flex items-center gap-2 border-t border-sand pt-3 text-xs text-muted">
                <History className="h-3.5 w-3.5" /> Status last changed {orderDate(order.statusUpdatedAt)}
                {order.statusUpdatedBy ? ` by @${order.statusUpdatedBy}` : ""}
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-sand">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-forest">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Message the customer
            </h2>
            <div className="flex flex-col gap-2">
              {waTemplates.map((t) => (
                <a
                  key={t.label}
                  href={whatsappLink(t.text, toWhatsAppNumber(order.phone))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-sand px-3.5 py-2.5 text-sm font-semibold text-forest hover:border-[#25D366] hover:bg-[#25D366]/5"
                >
                  {t.label}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
