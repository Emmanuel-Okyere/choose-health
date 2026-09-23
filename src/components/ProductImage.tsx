import Image from "next/image";

const palettes: Record<string, { bg: string; dot: string }> = {
  "nuts-seeds": { bg: "from-[#f3e6c8] to-[#e8d3a4]", dot: "#a0772f" },
  spices: { bg: "from-[#f8e2c7] to-[#f0c79a]", dot: "#c2471b" },
  detox: { bg: "from-[#e3e7e0] to-[#c9d1c5]", dot: "#1e2a22" },
  balms: { bg: "from-[#e1eef3] to-[#c5dde7]", dot: "#2b6b87" },
  "herbs-teas": { bg: "from-[#e4efd9] to-[#c9dfb4]", dot: "#2f7a3c" },
  oils: { bg: "from-[#f7efcf] to-[#ecd98f]", dot: "#a07a12" },
  other: { bg: "from-[#ece3cf] to-[#ddd0b3]", dot: "#5d6b61" },
};

type Props = { src: string | null; name: string; category: string; className?: string; sizes?: string; label?: boolean };

// Shows the product photo, or a patterned "seed sack" illustration when no photo exists yet.
export function ProductImage({ src, name, category, className = "", sizes = "300px", label = true }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image src={src} alt={name} fill sizes={sizes} className="object-contain p-2" />
      </div>
    );
  }
  const p = palettes[category] ?? palettes["nuts-seeds"];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${p.bg} ${className}`}
      role="img"
      aria-label={name}
    >
      <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <ellipse
            key={i}
            cx={(i * 37) % 120}
            cy={(i * 23) % 80}
            rx="2.6"
            ry="1.6"
            transform={`rotate(${(i * 47) % 180} ${(i * 37) % 120} ${(i * 23) % 80})`}
            fill={p.dot}
          />
        ))}
      </svg>
      {label && <span className="relative rounded-full bg-paper/85 px-3 py-1.5 font-display text-sm font-semibold text-forest shadow-sm">
        {name}
      </span>}
    </div>
  );
}
