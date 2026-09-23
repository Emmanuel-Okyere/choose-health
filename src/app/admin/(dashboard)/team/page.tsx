import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { sql } from "@/lib/db";
import { ownerAccount, requireAdmin, type AdminRole } from "@/lib/admin-session";
import { shortDate } from "@/lib/format";
import { RoleBadge } from "../RoleBadge";
import { AddAdminForm, UserActions } from "./TeamForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team", robots: { index: false } };

type Row = { id: number; username: string; name: string; role: AdminRole; createdBy: string | null; createdAt: Date };

export default async function TeamPage() {
  const me = await requireAdmin();
  const canManage = me.role === "super_admin";
  const owner = ownerAccount();
  const users = await sql<Row[]>`
    SELECT id, username, name, role, created_by, created_at FROM admin_users
    ORDER BY (role = 'super_admin') DESC, created_at`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold text-forest">Team</h1>
        <p className="mt-2 max-w-2xl text-muted">
          <strong className="text-forest">Super admins</strong> can add, edit and remove team members.{" "}
          <strong className="text-forest">Admins</strong> can manage orders and their own password. The owner account
          is set on the server and can&apos;t be removed.
        </p>
      </div>

      {canManage && <AddAdminForm />}

      <ul className="divide-y divide-sand overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
        <li className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="flex flex-wrap items-center gap-2 font-semibold text-forest">
              {owner.name} <span className="font-normal text-muted">@{owner.username}</span>
              <RoleBadge role="super_admin" isOwner />
              {me.isOwner && <span className="text-xs text-muted">(you)</span>}
            </p>
            <p className="text-sm text-muted">Default super admin · set with ADMIN_USERNAME / ADMIN_PASSWORD</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Lock className="h-4 w-4" /> Can&apos;t be removed
          </span>
        </li>
        {users.map((u) => {
          const isMe = me.id === String(u.id);
          return (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold text-forest">
                  {u.name} <span className="font-normal text-muted">@{u.username}</span>
                  <RoleBadge role={u.role} />
                  {isMe && <span className="text-xs text-muted">(you)</span>}
                </p>
                <p className="text-sm text-muted">
                  Added {shortDate(u.createdAt)}
                  {u.createdBy ? ` by @${u.createdBy}` : ""}
                </p>
              </div>
              {canManage && !isMe && <UserActions id={u.id} name={u.name} role={u.role} />}
            </li>
          );
        })}
        {users.length === 0 && (
          <li className="p-5 text-sm text-muted">No other team members yet.</li>
        )}
      </ul>
    </div>
  );
}
