"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { ownerUsername } from "@/lib/auth";
import { requireSuperAdmin, type AdminRole } from "@/lib/admin-session";
import { MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/passwords";

// Every action here is super-admin only. Regular admins can't add, edit or delete anyone.
// The owner account lives in env vars (not the admin_users table), so it can't be targeted.

export type TeamActionState = { error?: string; success?: string };

const ROLES: AdminRole[] = ["super_admin", "admin"];
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

function targetId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createAdmin(_prev: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const me = await requireSuperAdmin();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role")) as AdminRole;

  if (!USERNAME_RE.test(username))
    return { error: "Username must be 3 to 32 characters: letters, numbers, dots, dashes or underscores." };
  if (username === ownerUsername()) return { error: "That username is reserved for the owner account." };
  if (name.length < 2 || name.length > 60) return { error: "Please enter the person's name." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (!ROLES.includes(role)) return { error: "Choose a role." };

  try {
    await sql`
      INSERT INTO admin_users (username, name, password_hash, role, created_by)
      VALUES (${username}, ${name}, ${await hashPassword(password)}, ${role}, ${me.username})`;
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { error: "That username is already taken." };
    throw err;
  }
  revalidatePath("/admin/team");
  return { success: `${name} can now sign in as "${username}".` };
}

export async function changeRole(_prev: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const me = await requireSuperAdmin();
  const id = targetId(formData);
  const role = String(formData.get("role")) as AdminRole;
  if (!id || !ROLES.includes(role)) return { error: "Invalid request." };
  if (String(id) === me.id) return { error: "You can't change your own role." };

  const result = await sql`UPDATE admin_users SET role = ${role} WHERE id = ${id}`;
  if (result.count === 0) return { error: "That user no longer exists." };
  revalidatePath("/admin/team");
  return { success: "Role updated." };
}

export async function resetPassword(_prev: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const me = await requireSuperAdmin();
  const id = targetId(formData);
  const password = String(formData.get("password") ?? "");
  if (!id) return { error: "Invalid request." };
  if (String(id) === me.id) return { error: "Use My account to change your own password." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };

  // Bumping session_version signs them out on every device.
  const result = await sql`
    UPDATE admin_users SET password_hash = ${await hashPassword(password)},
      session_version = session_version + 1
    WHERE id = ${id}`;
  if (result.count === 0) return { error: "That user no longer exists." };
  return { success: "Password reset. They've been signed out everywhere." };
}

export async function deleteAdmin(_prev: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const me = await requireSuperAdmin();
  const id = targetId(formData);
  if (!id) return { error: "The owner account can't be deleted." };
  if (String(id) === me.id) return { error: "You can't delete your own account." };

  await sql`DELETE FROM admin_users WHERE id = ${id}`;
  revalidatePath("/admin/team");
  return { success: "User removed." };
}
