"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Package, UserCog, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/orders") : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition md:px-3.5 ${
              active ? "bg-forest text-cream" : "text-forest hover:bg-sand"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
