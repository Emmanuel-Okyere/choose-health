import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-session";
import { RoleBadge } from "../RoleBadge";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-4xl font-semibold text-forest">My account</h1>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-sand">
        <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-forest">
          {me.name} <span className="font-normal text-muted">@{me.username}</span>
          <RoleBadge role={me.role} isOwner={me.isOwner} />
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-sand">
        <h2 className="mb-4 font-display text-xl font-semibold text-forest">Change password</h2>
        {me.isOwner ? (
          <p className="text-sm leading-relaxed text-muted">
            You&apos;re signed in as the owner. Your username and password come from the{" "}
            <code className="rounded bg-sand px-1">ADMIN_USERNAME</code> and{" "}
            <code className="rounded bg-sand px-1">ADMIN_PASSWORD</code> environment variables. Change them in Vercel →
            Settings → Environment Variables, then redeploy. Changing ADMIN_PASSWORD signs every admin out unless{" "}
            <code className="rounded bg-sand px-1">AUTH_SECRET</code> is set.
          </p>
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}
