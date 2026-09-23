"use server";

import { sql } from "@/lib/db";
import { requireAdmin, startSession } from "@/lib/admin-session";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/passwords";

export type AccountState = { error?: string; success?: string };

export async function changeOwnPassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const me = await requireAdmin();
  if (me.isOwner) return { error: "The owner password is set with the ADMIN_PASSWORD environment variable." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const [row] = await sql<{ passwordHash: string }[]>`SELECT password_hash FROM admin_users WHERE id = ${Number(me.id)}`;
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { error: "Your current password is incorrect." };
  if (next.length < MIN_PASSWORD_LENGTH) return { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (next !== confirm) return { error: "The new passwords don't match." };

  // Sign out other devices, then re-issue this device's session with the new version.
  const [updated] = await sql<{ sessionVersion: number }[]>`
    UPDATE admin_users SET password_hash = ${await hashPassword(next)}, session_version = session_version + 1
    WHERE id = ${Number(me.id)} RETURNING session_version`;
  await startSession({ id: me.id, sessionVersion: updated.sessionVersion });
  return { success: "Password changed. Other devices have been signed out." };
}
