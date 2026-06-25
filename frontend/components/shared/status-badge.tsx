import { Badge } from "@/components/ui/badge";
import { SimulatorStatus } from "@/types/simulator";

const variants: Record<SimulatorStatus, "default" | "success" | "warning" | "destructive" | "muted" | "vip"> = {
  ready_to_play: "muted",
  busy: "success",
  reserved: "warning",
  unpaid: "destructive",
  broken: "destructive",
  repair_requested: "warning",
  repair_approved: "vip",
  fixing: "vip",
  fixed_waiting_confirmation: "warning",
  offline: "muted",
  locked: "muted",
};

const labels: Record<SimulatorStatus, string> = {
  ready_to_play: "Tayyor",
  busy: "Band",
  reserved: "Bron",
  unpaid: "Qarz",
  broken: "Buzilgan",
  repair_requested: "Ta'mirda",
  repair_approved: "Tasdiqlangan",
  fixing: "Ta'mirlanmoqda",
  fixed_waiting_confirmation: "Tasdiq kutilmoqda",
  offline: "Oflayn",
  locked: "Qulflangan",
};

export function StatusBadge({ status }: { status: SimulatorStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
