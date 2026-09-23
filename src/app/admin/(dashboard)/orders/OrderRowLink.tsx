"use client";

import { useRouter } from "next/navigation";

/** Makes a whole table row open the order, while inner controls (status select, links) still work. */
export function OrderRowLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button,select,input")) return;
        router.push(href);
      }}
      className="cursor-pointer transition hover:bg-cream/60"
    >
      {children}
    </tr>
  );
}
