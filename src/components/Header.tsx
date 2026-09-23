"use client";

import Link from "next/link";
import { Phone, ShoppingBasket } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "./cart/CartProvider";
import { site } from "@/lib/site";

const nav = [
  { href: "/#shop", label: "Shop" },
  { href: "/#wholesale", label: "Wholesale" },
  { href: "/remedies", label: "Remedies" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/#visit", label: "Visit us" },
];

// On phones the main navigation lives in the bottom tab bar (MobileTabBar), so the header stays slim.
export function Header() {
  const { count, open } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6 md:py-3">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-6 text-[0.95rem] font-medium md:flex lg:gap-7">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/80 transition hover:text-leaf-dark">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.phones[0].tel}`}
            aria-label={`Call ${site.phones[0].display}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest hover:bg-sand lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2 lg:text-sm lg:font-semibold"
          >
            <Phone className="h-4 w-4" /> <span className="hidden lg:inline">{site.phones[0].display}</span>
          </a>
          <button
            onClick={open}
            className="relative hidden items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep md:flex"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBasket className="h-4 w-4" />
            Basket
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-kente px-1 text-xs font-bold text-forest-deep">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
