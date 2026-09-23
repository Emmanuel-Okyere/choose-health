"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";
import type { AdminRole } from "@/lib/admin-session";
import {
  changeRole,
  createAdmin,
  deleteAdmin,
  resetPassword,
  type TeamActionState,
} from "./actions";

const field =
  "mt-1.5 w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20";

function Feedback({ state }: { state: TeamActionState }) {
  if (state.error) return <p role="alert" className="text-sm font-medium text-cayenne">{state.error}</p>;
  if (state.success) return <p role="status" className="text-sm font-medium text-leaf-dark">{state.success}</p>;
  return null;
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState(createAdmin, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="rounded-2xl bg-white p-6 ring-1 ring-sand">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest">
        <UserPlus className="h-5 w-5" /> Add a team member
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required className={field} placeholder="Ama Mensah" />
        </label>
        <label className="text-sm font-semibold">
          Username
          <input name="username" required autoCapitalize="none" autoComplete="off" pattern="[A-Za-z0-9._\-]{3,32}" className={field} placeholder="ama" />
        </label>
        <label className="text-sm font-semibold">
          Temporary password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        <label className="text-sm font-semibold">
          Role
          <select name="role" defaultValue="admin" className={field}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button disabled={pending} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-70">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add member
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function UserActions({ id, name, role }: { id: number; name: string; role: AdminRole }) {
  const [roleState, roleAction, rolePending] = useActionState(changeRole, {});
  const [pwState, pwAction, pwPending] = useActionState(resetPassword, {});
  const [delState, delAction, delPending] = useActionState(deleteAdmin, {});
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* key: remount when the saved role changes, so the select shows the new value after React resets the form */}
        <form key={role} action={roleAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <select
            name="role"
            defaultValue={role}
            aria-label={`Role for ${name}`}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            disabled={rolePending}
            className="rounded-lg border border-sand bg-white px-3 py-2 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </form>
        <button
          type="button"
          onClick={() => setShowReset((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-sand px-3 py-2 text-sm font-semibold text-forest hover:bg-sand"
        >
          <KeyRound className="h-4 w-4" /> Reset password
        </button>
        <form
          action={delAction}
          onSubmit={(e) => {
            if (!confirm(`Remove ${name} from the team? They will be signed out immediately.`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button disabled={delPending} className="flex items-center gap-1.5 rounded-lg border border-cayenne/30 px-3 py-2 text-sm font-semibold text-cayenne hover:bg-cayenne/10 disabled:opacity-60">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </form>
      </div>
      {showReset && (
        <form action={pwAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="New password" aria-label={`New password for ${name}`} className="rounded-lg border border-sand bg-paper px-3 py-2 text-sm" />
          <button disabled={pwPending} className="rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-cream disabled:opacity-70">
            Save
          </button>
        </form>
      )}
      <Feedback state={roleState} />
      <Feedback state={pwState} />
      <Feedback state={delState} />
    </div>
  );
}
