"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Home, ShoppingBasket, Store } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import { WhatsAppIcon } from "./WhatsAppFab";
import { cedis } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

// Pages that have their own bottom action bar (or are admin), where the tab bar would get in the way.
const HIDDEN_ON = ["/checkout", "/order", "/admin"];

/** App-style bottom navigation for phones (hidden from md up). */
export function MobileTabBar() {
  const pathname = usePathname();
  const { count, subtotal, open, isOpen } = useCart();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const onHome = pathname === "/";
  const tabs = [
    { href: "/", label: "Home", icon: Home, active: onHome && hash !== "#shop" },
    { href: "/#shop", label: "Shop", icon: Store, active: onHome && hash === "#shop" },
    { href: "/remedies", label: "Remedies", icon: BookOpen, active: pathname.startsWith("/remedies") },
  ];

  return (
    <>
    {/* Spacer so the fixed bars never cover the end of the page */}
    <div aria-hidden="true" className={`bg-forest-deep md:hidden ${count > 0 ? "h-[8.5rem]" : "h-16"}`} />
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      {/* "View basket" bar, like food-delivery apps */}
      {count > 0 && !isOpen && (
        <div className="px-3 pb-2">
          <button
            onClick={open}
            className="flex w-full items-center justify-between rounded-2xl bg-forest px-4 py-3 text-cream shadow-xl shadow-forest/30"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-kente px-1.5 text-xs font-bold text-forest-deep">
                {count}
              </span>
              View basket
            </span>
            <span className="flex items-center gap-1 font-display font-semibold">
              {cedis(subtotal)} <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      <nav className="pb-safe border-t border-sand bg-paper/95 backdrop-blur" aria-label="Main">
        <div className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setHash(href.includes("#") ? href.slice(href.indexOf("#")) : "")}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-forest" : "text-muted"}`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full transition ${active ? "bg-leaf/15" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              {label}
            </Link>
          ))}
          <a
            href={whatsappLink("Hello Natural Health Retreat, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted"
          >
            <span className="flex h-7 w-12 items-center justify-center">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            </span>
            Chat
          </a>
          <button onClick={open} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted" aria-label={`Basket, ${count} items`}>
            <span className="relative flex h-7 w-12 items-center justify-center">
              <ShoppingBasket className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cayenne px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            Basket
          </button>
        </div>
      </nav>
    </div>
    </>
  );
}
