import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { logout } from "../login/actions";
import { AdminNav } from "./AdminNav";
import { RoleBadge } from "./RoleBadge";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <main className="flex-1 bg-paper">
      <div className="border-b border-sand bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <AdminNav />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">
              Signed in as <strong className="text-forest">{user.name}</strong>
            </span>
            <RoleBadge role={user.role} isOwner={user.isOwner} />
            <form action={logout}>
              <button className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-1.5 font-semibold text-forest hover:bg-sand">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </main>
  );
}
