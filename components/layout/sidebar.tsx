"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconType } from "react-icons";
import { FiBarChart2, FiCalendar, FiCpu, FiDatabase, FiGift, FiGrid, FiHome, FiLogOut, FiMessageCircle, FiMonitor, FiPieChart, FiSettings, FiShoppingBag, FiShoppingCart, FiTag, FiUsers } from "react-icons/fi";
import { RiGamepadLine } from "react-icons/ri";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const items: { key: string; label: string; href: string; icon: IconType }[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: FiHome },
  { key: "simulators", label: "Maket / Simulator Map", href: "/dashboard/simulators", icon: FiGrid },
  { key: "simulators", label: "Simulatorlar", href: "/dashboard/simulators", icon: FiMonitor },
  { key: "cashier", label: "Kassa", href: "/dashboard/cashier", icon: FiShoppingCart },
  { key: "bookings", label: "Bronlar", href: "/dashboard/bookings", icon: FiCalendar },
  { key: "customers", label: "Mijozlar", href: "/dashboard/customers", icon: FiUsers },
  { key: "shop", label: "Do'kon", href: "/dashboard/shop", icon: FiShoppingBag },
  { key: "tariffs", label: "Tariflar", href: "/dashboard/tariffs", icon: FiTag },
  { key: "games", label: "O'yinlar", href: "/dashboard/games", icon: RiGamepadLine },
  { key: "logs", label: "Loglar", href: "/dashboard/logs", icon: FiDatabase },
  { key: "promo", label: "Promo", href: "/dashboard/promo", icon: FiGift },
  { key: "reports", label: "Hisobotlar", href: "/dashboard/reports", icon: FiBarChart2 },
  { key: "analytics", label: "Analitika", href: "/dashboard/analytics", icon: FiPieChart },
  { key: "support", label: "Support", href: "/dashboard/support", icon: FiMessageCircle },
  { key: "settings", label: "Sozlamalar", href: "/dashboard/settings", icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user?.role;
  const visible = items.filter((item) => canAccess(role, item.key));

  return (
    <aside className="flex h-screen w-[272px] shrink-0 flex-col border-r border-slate-800 bg-[#11182b]">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950">B2</div>
        <div>
          <div className="font-bold text-white">B2 Game Club</div>
          <div className="text-xs text-slate-400">Main Arena</div>
        </div>
      </div>
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar><AvatarFallback>{data?.user?.name?.slice(0, 2).toUpperCase() ?? "OP"}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{data?.user?.name ?? "operator"}</div>
            <div className="text-xs text-slate-400">{data?.user?.phone}</div>
          </div>
          <Badge variant="muted" className="ml-auto">{role}</Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-100", active && "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/20")}>
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400"><FiLogOut /> Chiqish</div>
      </div>
    </aside>
  );
}
