"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconType } from "react-icons";
import { FiBarChart2, FiCalendar, FiChevronLeft, FiChevronRight, FiCpu, FiDatabase, FiGift, FiHome, FiLogOut, FiMessageCircle, FiMonitor, FiPieChart, FiSettings, FiShoppingCart, FiTag, FiUserCheck, FiUsers, FiX } from "react-icons/fi";
import { RiGamepadLine } from "react-icons/ri";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const items: { key: string; label: string; href: string; icon: IconType }[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: FiHome },
  { key: "simulators", label: "Simulatorlar", href: "/dashboard/simulators", icon: FiMonitor },
  { key: "cashier", label: "Kassa", href: "/dashboard/cashier", icon: FiShoppingCart },
  { key: "bookings", label: "Bronlar", href: "/dashboard/bookings", icon: FiCalendar },
  { key: "customers", label: "Mijozlar", href: "/dashboard/customers", icon: FiUsers },
  { key: "admins", label: "Adminlar", href: "/dashboard/admins", icon: FiUserCheck },
  { key: "tariffs", label: "Tariflar", href: "/dashboard/tariffs", icon: FiTag },
  { key: "games", label: "O'yinlar", href: "/dashboard/games", icon: RiGamepadLine },
  { key: "logs", label: "Loglar", href: "/dashboard/logs", icon: FiDatabase },
  { key: "promo", label: "Promo", href: "/dashboard/promo", icon: FiGift },
  { key: "reports", label: "Hisobotlar", href: "/dashboard/reports", icon: FiBarChart2 },
  { key: "analytics", label: "Analitika", href: "/dashboard/analytics", icon: FiPieChart },
  { key: "support", label: "Support", href: "/dashboard/support", icon: FiMessageCircle },
  { key: "settings", label: "Sozlamalar", href: "/dashboard/settings", icon: FiSettings },
];

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapsed }: { collapsed: boolean; mobileOpen: boolean; onCloseMobile: () => void; onToggleCollapsed: () => void }) {
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user?.role;
  const visible = items.filter((item) => canAccess(role, item.key));

  return (
    <>
      {mobileOpen ? <button aria-label="Close sidebar overlay" className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onCloseMobile} /> : null}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col border-r border-slate-800 bg-[#11182b] transition-transform duration-200 md:static md:z-auto md:translate-x-0",
        collapsed ? "md:w-[84px]" : "md:w-[272px]",
        mobileOpen ? "w-[min(86vw,292px)] translate-x-0" : "w-[min(86vw,292px)] -translate-x-full",
      )}>
      <div className={cn("flex h-16 items-center gap-3 border-b border-slate-800 px-4", collapsed && "md:justify-center md:px-3")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950">B2</div>
        <div className={cn("min-w-0", collapsed && "md:hidden")}>
          <div className="font-bold text-white">B2 Game Club</div>
          <div className="text-xs text-slate-400">Main Arena</div>
        </div>
        <button className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden" onClick={onCloseMobile} aria-label="Close sidebar"><FiX /></button>
      </div>
      <div className={cn("border-b border-slate-800 p-3", collapsed && "md:px-2")}>
        <div className={cn("flex items-center gap-3", collapsed && "md:justify-center")}>
          <Avatar className="shrink-0"><AvatarFallback>{data?.user?.name?.slice(0, 2).toUpperCase() ?? "OP"}</AvatarFallback></Avatar>
          <div className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
            <div className="truncate text-sm font-semibold text-white">{data?.user?.name ?? "operator"}</div>
            <Badge variant="muted" className="mt-2 max-w-full truncate">{role}</Badge>
          </div>
        </div>
      </div>
      <ScrollArea className={cn("flex-1 py-4", collapsed ? "md:px-2" : "px-3")}>
        <nav className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-100",
                  collapsed && "md:justify-center md:px-2",
                  active && "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/20",
                )}
              >
                <Icon className="shrink-0 text-lg" />
                <span className={cn("truncate", collapsed && "md:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className={cn("border-t border-slate-800 p-3", collapsed && "md:px-2")}>
        <button
          className={cn("mb-2 hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white md:flex", collapsed && "justify-center px-2")}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          <span className={cn(collapsed && "md:hidden")}>{collapsed ? "Open" : "Kichraytirish"}</span>
        </button>
        <div className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400", collapsed && "md:justify-center md:px-2")}><FiLogOut /><span className={cn(collapsed && "md:hidden")}>Chiqish</span></div>
      </div>
    </aside>
    </>
  );
}
