export function StockBadge({ inStock, quantity }: { inStock: boolean; quantity: number | null }) {
  if (!inStock || quantity === 0)
    return <span className="rounded-full bg-cayenne/10 px-2 py-0.5 text-xs font-bold text-cayenne">Sold out</span>;
  if (quantity === null) return <span className="text-xs text-muted">In stock</span>;
  if (quantity <= 5)
    return <span className="rounded-full bg-kente/25 px-2 py-0.5 text-xs font-bold text-forest-deep">Only {quantity} left</span>;
  return <span className="text-xs font-semibold text-leaf-dark">{quantity} in stock</span>;
}
