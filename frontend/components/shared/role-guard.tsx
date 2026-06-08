"use client";

import { useSession } from "next-auth/react";
import { canAccess, canUseAction } from "@/lib/permissions";

export function RoleGuard({ children, page, action }: { children: React.ReactNode; page?: string; action?: string }) {
  const { data } = useSession();
  const role = data?.user?.role;
  const allowed = page ? canAccess(role, page) : action ? canUseAction(role, action) : Boolean(role);
  return allowed ? <>{children}</> : null;
}
