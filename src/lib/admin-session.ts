import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import {
  OWNER_ID,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  ownerUsername,
  readSessionToken,
} from "./auth";

export type AdminRole = "super_admin" | "admin";

export type AdminUser = {
  id: string; // "owner" or the admin_users id
  username: string;
  name: string;
  role: AdminRole;
  isOwner: boolean;
  sessionVersion: number;
};

export function ownerAccount(): AdminUser {
  return {
    id: OWNER_ID,
    username: ownerUsername(),
    name: process.env.ADMIN_NAME || "Owner",
    role: "super_admin",
    isOwner: true,
    sessionVersion: 0,
  };
}

/** The signed-in admin, re-checked against the database on every request (deduped per request). */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const claims = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  if (claims.uid === OWNER_ID) return process.env.ADMIN_PASSWORD ? ownerAccount() : null;

  const id = Number(claims.uid);
  if (!Number.isInteger(id)) return null;
  const [row] = await sql<{ id: number; username: string; name: string; role: AdminRole; sessionVersion: number }[]>`
    SELECT id, username, name, role, session_version FROM admin_users WHERE id = ${id}`;
  if (!row || row.sessionVersion !== claims.ver) return null; // deleted, or signed out everywhere
  return { ...row, id: String(row.id), isOwner: false };
});

/** Call at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (user.role !== "super_admin") redirect("/admin");
  return user;
}

export async function startSession(user: Pick<AdminUser, "id" | "sessionVersion">) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(user.id, user.sessionVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
