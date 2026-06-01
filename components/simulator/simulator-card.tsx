"use client";

import { FiClock, FiDollarSign, FiUser } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { minutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Simulator } from "@/types/simulator";

const statusClass = {
  free: "border-slate-700 bg-slate-900/75",
  busy: "border-emerald-400/60 bg-emerald-950/20",
  reserved: "border-amber-400/70 bg-amber-950/20",
  ending_soon: "border-orange-400 bg-orange-950/20 animate-pulse",
  unpaid: "border-red-400 bg-red-950/20",
  offline: "border-slate-800 bg-slate-950/50 opacity-55",
  maintenance: "border-fuchsia-400/60 bg-fuchsia-950/20",
  locked: "border-slate-600 bg-slate-900/40 opacity-70",
  paused: "border-amber-400 bg-amber-950/20",
};

export function SimulatorCard({ simulator, selected, onClick }: { simulator: Simulator; selected: boolean; onClick: () => void }) {
  return (
    <Card onClick={onClick} className={cn("relative min-h-[132px] cursor-pointer p-3 transition hover:-translate-y-0.5 hover:border-sky-400/70", statusClass[simulator.status], selected && "border-sky-300 shadow-glow")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500">{simulator.type}</div>
          <div className="text-lg font-black text-white">{simulator.name}</div>
        </div>
        <StatusBadge status={simulator.status} />
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-slate-300">
        <div className="flex items-center gap-2"><FiUser className="text-slate-500" /> {simulator.currentUser ?? "Guest ready"}</div>
        <div className="flex items-center gap-2"><FiClock className="text-slate-500" /> {simulator.remainingMinutes ? minutes(simulator.remainingMinutes) : simulator.zone}</div>
        <div className="flex items-center gap-2"><FiDollarSign className={simulator.paymentStatus === "unpaid" ? "text-red-300" : "text-slate-500"} /> {simulator.paymentStatus}</div>
      </div>
    </Card>
  );
}
