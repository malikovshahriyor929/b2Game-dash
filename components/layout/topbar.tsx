"use client";

import { signOut, useSession } from "next-auth/react";
import { FiClock, FiLock, FiLogOut, FiMoon, FiPlay, FiPlusCircle, FiPower, FiRefreshCw, FiSearch, FiSquare, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { canUseAction } from "@/lib/permissions";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export function Topbar({ onAction }: { onAction: (action: "start" | "addTime" | "payment" | "stop") => void }) {
  const { data } = useSession();
  const { simulators, selected, revenue, toggleLock, setMaintenance } = useDashboardStore();
  const role = data?.user?.role;
  const active = simulators.filter((item) => ["busy", "ending_soon", "unpaid"].includes(item.status)).length;
  const free = simulators.filter((item) => item.status === "free").length;
  const reserved = simulators.filter((item) => item.status === "reserved").length;

  const quickActions = [
    { key: "refresh", label: "Refresh", icon: FiRefreshCw, enabled: true, click: () => location.reload() },
    { key: "start", label: "Start", icon: FiPlay, enabled: Boolean(selected && ["free", "reserved"].includes(selected.status) && canUseAction(role, "start")), click: () => onAction("start") },
    { key: "addTime", label: "Add time", icon: FiPlusCircle, enabled: Boolean(selected && ["busy", "ending_soon", "unpaid"].includes(selected.status) && canUseAction(role, "addTime")), click: () => onAction("addTime") },
    { key: "payment", label: "Payment", icon: FiClock, enabled: Boolean(selected && selected.status !== "free" && canUseAction(role, "payment")), click: () => onAction("payment") },
    { key: "stop", label: "Stop", icon: FiSquare, enabled: Boolean(selected && ["busy", "ending_soon", "unpaid"].includes(selected.status) && canUseAction(role, "stop")), click: () => onAction("stop") },
    { key: "lock", label: "Lock", icon: FiLock, enabled: Boolean(selected && canUseAction(role, "lock")), click: () => selected && toggleLock(selected.id) },
    { key: "reboot", label: "Reboot", icon: FiPower, enabled: Boolean(selected && canUseAction(role, "reboot")), click: () => selected && setMaintenance(selected.id, false) },
  ];

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 flex-wrap items-center gap-2 border-b border-slate-800 bg-[#151c31]/95 px-3 py-2 sm:gap-3 sm:px-4 lg:flex-nowrap lg:py-0">
      <div className="order-1 min-w-0 flex-1 lg:flex-none">
        <div className="truncate text-sm font-semibold text-white">B2 Game Club</div>
        <div className="truncate text-xs text-slate-400">Main Arena</div>
      </div>

      <div className="order-2 flex shrink-0 items-center gap-2 lg:order-none">
        <Badge variant="success" className="whitespace-nowrap">Smena ochiq</Badge>
      </div>

      <div className="order-5 flex w-full items-center gap-2 overflow-x-auto pb-1 sm:order-3 sm:w-auto sm:max-w-[calc(100vw-7rem)] sm:pb-0 lg:order-none lg:max-w-none">
        <Badge className="shrink-0 whitespace-nowrap">{money(revenue)}</Badge>
        <Badge variant="success" className="shrink-0 whitespace-nowrap">{active} active</Badge>
        <Badge variant="muted" className="shrink-0 whitespace-nowrap">{free} free</Badge>
        <Badge variant="warning" className="shrink-0 whitespace-nowrap">{reserved} bron</Badge>
      </div>

      <div className="relative order-4 w-full min-w-0 sm:order-4 sm:flex-1 lg:order-none lg:ml-auto lg:max-w-sm 2xl:max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input className="h-9 pl-9" placeholder="Search simulator, customer, order..." />
      </div>

      <div className="order-3 ml-auto flex min-w-0 shrink-0 items-center gap-2 lg:order-none lg:ml-0">
        <TooltipProvider>
          <div className="flex max-w-[calc(100vw-7rem)] gap-1 overflow-x-auto sm:max-w-none">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Tooltip key={action.key}>
                  <TooltipTrigger asChild>
                    <Button className="shrink-0" size="icon" variant={action.key === "stop" ? "destructive" : "secondary"} disabled={!action.enabled} onClick={action.click}><Icon /></Button>
                  </TooltipTrigger>
                  <TooltipContent>{action.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <Button className="shrink-0" size="icon" variant="ghost"><FiMoon /><span className="sr-only"><FiSun /></span></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-full outline-none ring-sky-400 focus:ring-2">
              <Avatar><AvatarFallback>{data?.user?.name?.slice(0, 2).toUpperCase() ?? "U"}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{data?.user?.name} - {data?.user?.role}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}><FiLogOut /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
