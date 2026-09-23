"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, ShoppingBasket, X } from "lucide-react";
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

export function Header() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-[0.95rem] font-medium md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/80 transition hover:text-leaf-dark">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.phones[0].tel}`}
            className="hidden items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest hover:bg-sand lg:flex"
          >
            <Phone className="h-4 w-4" /> {site.phones[0].display}
          </a>
          <button
            onClick={open}
            className="relative flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBasket className="h-4 w-4" />
            <span className="hidden sm:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-kente px-1 text-xs font-bold text-forest-deep">
                {count}
              </span>
            )}
          </button>
          <button
            className="rounded-full p-2 hover:bg-sand md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-sand bg-paper px-4 pb-4 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="block border-b border-sand/70 py-3 font-medium">
              {n.label}
            </Link>
          ))}
          <a href={`tel:${site.phones[0].tel}`} className="mt-3 flex items-center gap-2 font-semibold text-forest">
            <Phone className="h-4 w-4" /> Call {site.phones[0].display}
          </a>
        </nav>
      )}
    </header>
  );
}
