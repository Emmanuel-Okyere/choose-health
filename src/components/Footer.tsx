import Link from "next/link";
import { Clock, MapPin, Phone, Smartphone } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-forest-deep text-cream/85">
      <div className="kente-stripe" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10 md:py-14">
        <div>
          <Logo inverted />
          <p className="mt-3 max-w-sm font-display text-xl italic text-cream md:mt-4 md:text-2xl">{site.tagline}.</p>
          <p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-cream/70 md:block">
            {site.legalName}. Natural remedies and naturopathic care in Awoshie, Accra.
          </p>
          <p className="mt-3 text-xs text-leaf-light md:mt-5 md:text-sm">#naturalremedy #Restocked #HealthyFoods</p>
        </div>

        {/* Mobile Money payment info */}
        <div className="rounded-2xl border border-kente/40 bg-forest p-4 md:rounded-3xl md:p-6">
          <div className="flex items-center gap-2 text-kente">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-semibold uppercase tracking-widest">Pay with MoMo</h3>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm md:mt-4 md:block md:space-y-2">
            <div>
              <dt className="text-cream/60">Network</dt>
              <dd className="font-semibold text-cream">{site.momo.network}</dd>
            </div>
            <div className="order-first col-span-2 md:order-none md:col-span-1">
              <dt className="text-cream/60">Number</dt>
              <dd className="font-display text-2xl font-semibold tracking-wide text-cream">{site.momo.number}</dd>
            </div>
            <div>
              <dt className="text-cream/60">Account name</dt>
              <dd className="font-semibold text-cream">{site.momo.accountName}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-cream/70">
            Use your order number (e.g. NH-7K2QX) as the payment reference, then send us a screenshot on WhatsApp.
          </p>
        </div>

        <div className="space-y-3 text-sm md:space-y-4">
          <h3 className="font-semibold uppercase tracking-widest text-kente">Visit & contact</h3>
          <p className="flex gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-light" />
            <span>
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city}
            </span>
          </p>
          {site.phones.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`} className="flex gap-2.5 hover:text-white">
              <Phone className="h-4 w-4 shrink-0 text-leaf-light" /> {p.label}: {p.display}
            </a>
          ))}
          <p className="flex gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-leaf-light" /> Mon-Thu, 9am-5pm
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-cream/70">
            <Link href="/#shop" className="hover:text-white">Shop</Link>
            <Link href="/remedies" className="hover:text-white">Remedies</Link>
            <Link href="/#about" className="hover:text-white">About</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs md:py-6 text-cream/55 sm:px-6 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <p className="max-w-xl md:text-right">
            Information on this site is for general wellbeing and does not replace diagnosis or treatment by a qualified health professional.
          </p>
        </div>
      </div>
    </footer>
  );
}
