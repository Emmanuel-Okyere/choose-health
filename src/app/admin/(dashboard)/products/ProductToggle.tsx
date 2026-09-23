"use client";

import { useOptimistic, useTransition } from "react";
import { setProductFlag } from "./actions";

/** Small on/off switch that saves immediately. */
export function ProductToggle({
  id,
  flag,
  value,
  label,
}: {
  id: number;
  flag: "inStock" | "isActive";
  value: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await setProductFlag(id, flag, !optimistic);
        })
      }
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        optimistic ? "bg-leaf" : "bg-sand"
      } ${pending ? "opacity-70" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${optimistic ? "translate-x-5.5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
