const items = [
  "🔥 Restocked: Cayenne Pepper",
  "Turmeric Powder",
  "Activated Charcoal Powder",
  "Black Pepper",
  "🥜 All nuts & seeds available wholesale",
  "📍 Pickup at Awoshie Lane 14",
  "🕘 Mon – Thu, 9am – 5pm",
];

export function RestockTicker() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-forest py-2.5 text-sm font-medium text-cream" aria-label="Latest news">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10" aria-hidden={i >= items.length}>
            {t}
            <span className="text-kente">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
