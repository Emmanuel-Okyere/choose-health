"use client";

import { useState } from "react";
import { Clock, Flame, Leaf, MapPin, Nut, Sparkle, type LucideIcon } from "lucide-react";

const items: { icon: LucideIcon; text: string }[] = [
  { icon: Flame, text: "Restocked: Cayenne Pepper" },
  { icon: Leaf, text: "Turmeric Powder" },
  { icon: Leaf, text: "Activated Charcoal Powder" },
  { icon: Leaf, text: "Black Pepper" },
  { icon: Nut, text: "All nuts & seeds available wholesale" },
  { icon: MapPin, text: "Pickup at Awoshie Lane 14" },
  { icon: Clock, text: "Mon-Thu, 9am-5pm" },
];

export function RestockTicker() {
  const [paused, setPaused] = useState(false);
  const row = [...items, ...items];
  return (
    <div
      className={`ticker cursor-pointer overflow-hidden bg-forest py-2 text-[13px] font-medium text-cream sm:py-2.5 sm:text-sm ${paused ? "paused" : ""}`}
      aria-label="Latest news (tap to pause)"
      onClick={() => setPaused((p) => !p)}
    >
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap will-change-transform sm:gap-10">
        {row.map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-10" aria-hidden={i >= items.length}>
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-kente" aria-hidden="true" />
              {text}
            </span>
            <Sparkle className="h-3 w-3 fill-kente text-kente" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
