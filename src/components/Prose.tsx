import { Fragment } from "react";

// Tiny renderer for the article body format: "## " headings, "- " bullets, **bold**, *italic*.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Prose({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-5 text-lg leading-relaxed text-ink/80">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 font-display text-2xl font-semibold text-forest">
              {block.slice(3)}
            </h2>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="space-y-2.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-2.5 h-2 w-2 shrink-0 rotate-45 rounded-sm bg-leaf" />
                  <span>{inline(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}
