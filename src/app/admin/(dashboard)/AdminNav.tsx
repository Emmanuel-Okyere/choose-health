"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UserCog, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Orders", icon: ClipboardList },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
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
