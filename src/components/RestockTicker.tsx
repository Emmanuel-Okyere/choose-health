import { Clock, Flame, Leaf, MapPin, Nut, Sparkle, type LucideIcon } from "lucide-react";

const items: { icon: LucideIcon; text: string }[] = [
  { icon: Flame, text: "Restocked: Cayenne Pepper" },
  { icon: Leaf, text: "Turmeric Powder" },
  { icon: Leaf, text: "Activated Charcoal Powder" },
  { icon: Leaf, text: "Black Pepper" },
  { icon: Nut, text: "All nuts & seeds available wholesale" },
  { icon: MapPin, text: "Pickup at Awoshie Lane 14" },
  { icon: Clock, text: "Mon – Thu, 9am – 5pm" },
];

export function RestockTicker() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-forest py-2.5 text-sm font-medium text-cream" aria-label="Latest news">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-10" aria-hidden={i >= items.length}>
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
