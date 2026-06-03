"use client";

import { signOut, useSession } from "next-auth/react";
import { FiClock, FiLock, FiLogOut, FiMenu, FiMoon, FiPlay, FiPlusCircle, FiRefreshCw, FiSearch, FiSquare, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { canUseAction } from "@/lib/permissions";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export function Topbar({ onAction, onOpenSidebar }: { onAction: (action: "start" | "addTime" | "payment" | "stop") => void; onOpenSidebar: () => void }) {
  const { data } = useSession();
  const { branches, period, revenue, selected, selectedBranchId, setPeriod, setSelectedBranchId, simulators, toggleLock } = useDashboardStore();
  const role = data?.user?.role;
  const branchOptions = role === "super_admin" ? branches : branches.filter((branch) => data?.user?.branchIds?.includes(branch.id));
  const active = simulators.filter((item) => ["busy", "unpaid"].includes(item.status)).length;
  const ready = simulators.filter((item) => item.status === "ready_to_play").length;
  const reserved = simulators.filter((item) => item.status === "reserved").length;
  const selectedBranchName = selectedBranchId === "all" ? "All branches" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Branch";

  const quickActions = [
    { key: "refresh", label: "Refresh", icon: FiRefreshCw, enabled: true, click: () => location.reload() },
    { key: "start", label: "Start", icon: FiPlay, enabled: Boolean(selected && ["ready_to_play", "reserved"].includes(selected.status) && canUseAction(role, "start")), click: () => onAction("start") },
    { key: "addTime", label: "Add time", icon: FiPlusCircle, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "addTime")), click: () => onAction("addTime") },
    { key: "payment", label: "Payment", icon: FiClock, enabled: Boolean(selected && selected.status !== "ready_to_play" && canUseAction(role, "payment")), click: () => onAction("payment") },
    { key: "stop", label: "Stop", icon: FiSquare, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "stop")), click: () => onAction("stop") },
    { key: "lock", label: "Lock", icon: FiLock, enabled: Boolean(selected && canUseAction(role, "lock")), click: () => selected && toggleLock(selected.id) },
  ];

  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-800 bg-[#151c31]/95 px-3 py-2 sm:gap-3 sm:px-4 xl:min-h-16 xl:flex-nowrap xl:py-0">
      <Button className="order-1 shrink-0 md:hidden" size="icon" variant="secondary" onClick={onOpenSidebar} aria-label="Open sidebar"><FiMenu /></Button>
      <div className="order-2 min-w-0 flex-1 sm:flex-none xl:order-none">
        <div className="truncate text-sm font-semibold text-white">B2 Game Club</div>
        <div className="truncate text-xs text-slate-400">{selectedBranchName}</div>
      </div>

      <div className="order-4 flex shrink-0 items-center gap-2 sm:order-3 xl:order-none">
        <Badge variant="success" className="whitespace-nowrap">Smena ochiq</Badge>
      </div>

      <div className="order-7 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:order-4 lg:w-[360px] xl:order-none">
        <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={role !== "super_admin"}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {role === "super_admin" ? <SelectItem value="all">All branches</SelectItem> : null}
            {branchOptions.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="order-8 flex w-full items-center gap-2 overflow-x-auto pb-1 sm:order-6 sm:w-auto sm:max-w-[calc(100vw-7rem)] sm:pb-0 xl:order-none xl:max-w-none">
        <Badge className="shrink-0 whitespace-nowrap">{money(revenue)}</Badge>
        <Badge variant="success" className="shrink-0 whitespace-nowrap">{active} active</Badge>
        <Badge variant="muted" className="shrink-0 whitespace-nowrap">{ready} ready</Badge>
        <Badge variant="warning" className="shrink-0 whitespace-nowrap">{reserved} bron</Badge>
      </div>

      <div className="relative order-6 w-full min-w-0 sm:order-5 sm:flex-1 xl:order-none xl:ml-auto xl:max-w-sm 2xl:max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input className="h-9 pl-9" placeholder="Search simulator, customer, order..." />
      </div>

      <div className="order-3 ml-auto flex min-w-0 shrink-0 items-center gap-2 xl:order-none xl:ml-0">
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
