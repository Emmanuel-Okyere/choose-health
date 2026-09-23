// Product categories, shared by the shop filter and the admin product form.
export const CATEGORIES = [
  { key: "spices", label: "Spices" },
  { key: "herbs-teas", label: "Herbs & teas" },
  { key: "detox", label: "Detox" },
  { key: "balms", label: "Balms & rubs" },
  { key: "nuts-seeds", label: "Nuts & seeds" },
  { key: "oils", label: "Oils" },
  { key: "other", label: "Other" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const categoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const BADGES = ["Restocked", "New", "Wholesale", "Sale"] as const;
