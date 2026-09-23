"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { deleteProductImage, moveProductImage, uploadProductImage } from "./actions";

const MAX_SIDE = 1600; // px. Plenty for a product page, and keeps each photo small in the database.

/** Shrinks a photo in the browser (fixing phone rotation) and returns WebP, or JPEG where WebP isn't supported. */
async function resizeImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await toBlob("image/webp", 0.85);
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.85); // older Safari
  if (!blob) throw new Error("Could not process this photo");
  return { blob, width, height };
}

export function ProductImages({ productId, imageIds }: { productId: number; imageIds: number[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      setProgress(`Uploading ${i + 1} of ${list.length}...`);
      try {
        const { blob, width, height } = await resizeImage(file);
        const fd = new FormData();
        fd.set("productId", String(productId));
        fd.set("file", new File([blob], "photo", { type: blob.type }));
        fd.set("width", String(width));
        fd.set("height", String(height));
        const res = await uploadProductImage(fd);
        if (res.error) {
          setError(`${file.name}: ${res.error}`);
          break;
        }
      } catch {
        setError(`${file.name}: this file couldn't be read as a photo.`);
        break;
      }
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const busy = pending || progress !== null;

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-sand md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-forest md:text-xl">Photos</h2>
          <p className="text-xs text-muted">The first photo is the main one. Up to 12 photos.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || imageIds.length >= 12}
          className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-60"
        >
          {progress ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {progress ?? "Add photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl bg-cayenne/10 px-3 py-2 text-sm text-cayenne">{error}</p>}

      {imageIds.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sand py-10 text-sm text-muted hover:border-leaf hover:text-leaf-dark"
        >
          <ImagePlus className="h-8 w-8" />
          No photos yet. Tap to add some.
        </button>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {imageIds.map((id, i) => (
            <li key={id} className="group relative">
              <div className={`relative aspect-square overflow-hidden rounded-xl bg-cream ring-2 ${i === 0 ? "ring-leaf" : "ring-transparent"}`}>
                <Image src={`/media/${id}`} alt={`Photo ${i + 1}`} fill sizes="160px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-leaf px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="h-3 w-3 fill-white" /> Main
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex">
                  <IconButton label="Move left" disabled={busy || i === 0} onClick={() => start(() => moveProductImage(id, "left"))}>
                    <ChevronLeft className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Move right" disabled={busy || i === imageIds.length - 1} onClick={() => start(() => moveProductImage(id, "right"))}>
                    <ChevronRight className="h-4 w-4" />
                  </IconButton>
                  {i !== 0 && (
                    <IconButton label="Make main photo" disabled={busy} onClick={() => start(() => moveProductImage(id, "first"))}>
                      <Star className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
                <IconButton
                  label="Delete photo"
                  danger
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Delete this photo?")) start(() => deleteProductImage(id));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-lg disabled:opacity-30 ${
        danger ? "text-cayenne hover:bg-cayenne/10" : "text-forest hover:bg-sand"
      }`}
    >
      {children}
    </button>
  );
}
