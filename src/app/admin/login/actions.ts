"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { canSignSessions, ownerUsername, safeEqual } from "@/lib/auth";
import { endSession, ownerAccount, startSession } from "@/lib/admin-session";
import { burnPasswordCheck, verifyPassword } from "@/lib/passwords";

export type LoginState = { error?: string };

const slowDown = () => new Promise((r) => setTimeout(r, 800)); // slows password guessing

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!(await canSignSessions())) {
    return { error: "Admin login is not set up yet. Add ADMIN_PASSWORD to the environment variables." };
  }

  let session: { id: string; sessionVersion: number } | null = null;

  if (username === ownerUsername()) {
    const expected = process.env.ADMIN_PASSWORD;
    if (expected && safeEqual(password, expected)) session = ownerAccount();
  } else {
    const [row] = await sql<{ id: number; passwordHash: string; sessionVersion: number }[]>`
      SELECT id, password_hash, session_version FROM admin_users WHERE username = ${username}`;
    if (!row) await burnPasswordCheck(password);
    else if (await verifyPassword(password, row.passwordHash)) {
      session = { id: String(row.id), sessionVersion: row.sessionVersion };
    }
  }

  if (!session) {
    await slowDown();
    return { error: "Incorrect username or password." };
  }

  await startSession(session);
  // Only allow redirects back into the admin area (prevents open redirects).
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
