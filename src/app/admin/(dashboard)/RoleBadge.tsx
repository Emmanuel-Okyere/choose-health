import { Crown, Shield, ShieldCheck } from "lucide-react";
import type { AdminRole } from "@/lib/admin-session";

export function RoleBadge({ role, isOwner = false }: { role: AdminRole; isOwner?: boolean }) {
  if (isOwner) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-kente/25 px-2.5 py-1 text-xs font-bold text-forest-deep">
        <Crown className="h-3.5 w-3.5" /> Owner
      </span>
    );
  }
  return role === "super_admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest px-2.5 py-1 text-xs font-bold text-cream">
      <ShieldCheck className="h-3.5 w-3.5" /> Super admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-bold text-leaf-dark">
      <Shield className="h-3.5 w-3.5" /> Admin
    </span>
  );
}
