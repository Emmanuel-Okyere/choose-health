"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole, User } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const input =
    "w-full rounded-xl border border-sand bg-paper py-3 pl-11 pr-4 outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block text-sm font-semibold">
        Username
        <span className="relative mt-1.5 block">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="username" required autoComplete="username" autoCapitalize="none" className={input} />
        </span>
      </label>
      <label className="block text-sm font-semibold">
        Password
        <span className="relative mt-1.5 block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-cayenne/10 px-4 py-3 text-sm font-medium text-cayenne">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 font-semibold text-cream hover:bg-forest-deep disabled:opacity-70"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
