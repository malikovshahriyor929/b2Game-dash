"use client";

import { FiClock, FiDollarSign, FiUser } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { minutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Simulator } from "@/types/simulator";

const statusClass = {
  ready_to_play: "border-slate-700 bg-slate-900/75",
  busy: "border-emerald-400/60 bg-emerald-950/20",
  reserved: "border-amber-400/70 bg-amber-950/20",
  unpaid: "border-red-400 bg-red-950/20",
  broken: "border-red-500 bg-red-950/25",
  repair_requested: "border-amber-400/70 bg-amber-950/20",
  repair_approved: "border-fuchsia-400/60 bg-fuchsia-950/20",
  fixing: "border-sky-400/60 bg-sky-950/20",
  fixed_waiting_confirmation: "border-lime-400/60 bg-lime-950/20",
  offline: "border-slate-800 bg-slate-950/50 opacity-55",
  locked: "border-slate-600 bg-slate-900/40 opacity-70",
};

function simulatorKind(simulator: Simulator) {
  return simulator.zone === "Standard" ? "Logitech" : "Moza VIP";
}

export function SimulatorCard({ simulator, selected, onClick, compact = false }: { simulator: Simulator; selected: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <Card onClick={onClick} className={cn("relative cursor-pointer transition hover:-translate-y-0.5 hover:border-sky-400/70", compact ? "min-h-[112px] p-2.5" : "min-h-[132px] p-3", statusClass[simulator.status], selected && "border-sky-300 shadow-glow")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold uppercase text-slate-500">{compact ? simulatorKind(simulator) : `${simulator.branchName} - ${simulatorKind(simulator)}`}</div>
          <div className={cn("font-black text-white", compact ? "text-base" : "text-lg")}>{simulator.name}</div>
        </div>
        <StatusBadge status={simulator.status} />
      </div>
      <div className={cn("space-y-1.5 text-xs text-slate-300", compact ? "mt-3" : "mt-4")}>
        <div className="flex items-center gap-2"><FiUser className="text-slate-500" /> {simulator.currentUser ?? "Guest ready"}</div>
        <div className="flex items-center gap-2"><FiClock className="text-slate-500" /> {simulator.remainingMinutes ? minutes(simulator.remainingMinutes) : simulatorKind(simulator)}</div>
        <div className="flex items-center gap-2"><FiDollarSign className={simulator.paymentStatus === "unpaid" ? "text-red-300" : "text-slate-500"} /> {simulator.paymentStatus}</div>
      </div>
    </Card>
  );
}
