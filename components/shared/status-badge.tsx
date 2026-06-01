import { Badge } from "@/components/ui/badge";
import { SimulatorStatus } from "@/types/simulator";

const variants: Record<SimulatorStatus, "default" | "success" | "warning" | "destructive" | "muted" | "vip"> = {
  free: "muted",
  busy: "success",
  reserved: "warning",
  ending_soon: "warning",
  unpaid: "destructive",
  offline: "muted",
  maintenance: "vip",
  locked: "muted",
  paused: "warning",
};

const labels: Record<SimulatorStatus, string> = {
  free: "Bo'sh",
  busy: "Band",
  reserved: "Bron",
  ending_soon: "Tugayapti",
  unpaid: "Qarz",
  offline: "Offline",
  maintenance: "Servis",
  locked: "Qulflangan",
  paused: "Pauza",
};

export function StatusBadge({ status }: { status: SimulatorStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
