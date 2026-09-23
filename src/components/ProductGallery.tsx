"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";

/** Swipeable photos with thumbnails. Swipe on phones, click thumbnails on desktop. */
export function ProductGallery({ images, name, category }: { images: string[]; name: string; category: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <ProductImage src={null} name={name} category={category} className="aspect-square w-full rounded-3xl" />;
  }

  function goTo(i: number) {
    setActive(i);
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-white ring-1 ring-sand"
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={images.length > 1 ? `${name}, photo ${i + 1} of ${images.length}` : name}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((src, i) => (
              <span key={src} className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-forest" : "w-1.5 bg-forest/25"}`} />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition ${
                i === active ? "ring-forest" : "ring-sand hover:ring-leaf/50"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
