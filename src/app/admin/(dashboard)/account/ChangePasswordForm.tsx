"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { changeOwnPassword } from "./actions";

const field =
  "mt-1.5 w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Current password
        <input name="current" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className="block text-sm font-semibold">
        New password
        <input name="next" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </label>
      <label className="block text-sm font-semibold">
        Confirm new password
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </label>
      {state.error && <p role="alert" className="text-sm font-medium text-cayenne">{state.error}</p>}
      {state.success && <p role="status" className="text-sm font-medium text-leaf-dark">{state.success}</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-70">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Change password
      </button>
    </form>
  );
}
