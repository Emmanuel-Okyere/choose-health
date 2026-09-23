type Props = { className?: string; showWordmark?: boolean; inverted?: boolean; compact?: boolean };

// Mark: a retreat "home" whose doorway is a sprouting leaf — healing that starts at home.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="37.5" cy="10.5" r="3.5" fill="var(--color-kente)" />
      <path
        d="M5 22.5 24 7l19 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 19.5V38a3 3 0 0 0 3 3h21a3 3 0 0 0 3-3V19.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path d="M24 38c-9-4.5-9.5-15.5 2.5-22 6.5 7 5 17.5-2.5 22Z" fill="var(--color-leaf)" />
      <path
        d="M24 38c-.8-7 0-13.5 2.4-21.5"
        fill="none"
        stroke="var(--color-cream)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className = "", showWordmark = true, inverted = false, compact = false }: Props) {
  // compact: slightly smaller on phones, full size from md up
  const mark = compact ? "h-8 w-8 md:h-10 md:w-10" : "h-10 w-10";
  const word = compact ? "text-[1.05rem] md:text-[1.2rem]" : "text-[1.2rem]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${mark} shrink-0 ${inverted ? "text-cream" : "text-forest"}`} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display ${word} font-semibold tracking-tight ${inverted ? "text-cream" : "text-forest"}`}
          >
            Natural Health
          </span>
          <span
            className={`mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] ${inverted ? "text-leaf-light" : "text-leaf-dark"}`}
          >
            Retreat · Reform
          </span>
        </span>
      )}
    </span>
  );
}
