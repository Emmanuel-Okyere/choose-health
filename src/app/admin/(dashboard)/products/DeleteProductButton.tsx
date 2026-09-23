"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete "${name}" permanently? Past orders keep their details. To keep it for later, untick "Show in the shop" instead.`))
          start(async () => {
            await deleteProduct(id);
          });
      }}
      className="flex items-center gap-2 rounded-full border border-cayenne/30 px-4 py-2 text-sm font-semibold text-cayenne hover:bg-cayenne/10 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete product
    </button>
  );
}
