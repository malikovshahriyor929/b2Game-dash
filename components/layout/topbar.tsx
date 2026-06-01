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
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 bg-[#151c31]/95 px-4">
      <div className="min-w-[170px]">
        <div className="text-sm font-semibold text-white">B2 Game Club</div>
        <div className="text-xs text-slate-400">Main Arena</div>
      </div>
      <Badge variant="success">Smena ochiq</Badge>
      <div className="hidden items-center gap-2 xl:flex">
        <Badge>{money(revenue)}</Badge>
        <Badge variant="success">{active} active</Badge>
        <Badge variant="muted">{free} free</Badge>
        <Badge variant="warning">{reserved} bron</Badge>
      </div>
      <div className="relative ml-auto w-72">
        <FiSearch className="absolute left-3 top-3 text-slate-500" />
        <Input className="h-9 pl-9" placeholder="Search simulator, customer, order..." />
      </div>
      <TooltipProvider>
        <div className="flex gap-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.key}>
                <TooltipTrigger asChild>
                  <Button size="icon" variant={action.key === "stop" ? "destructive" : "secondary"} disabled={!action.enabled} onClick={action.click}><Icon /></Button>
                </TooltipTrigger>
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <Button size="icon" variant="ghost"><FiMoon /><span className="sr-only"><FiSun /></span></Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none ring-sky-400 focus:ring-2">
            <Avatar><AvatarFallback>{data?.user?.name?.slice(0, 2).toUpperCase() ?? "U"}</AvatarFallback></Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{data?.user?.name} - {data?.user?.role}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}><FiLogOut /> Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
