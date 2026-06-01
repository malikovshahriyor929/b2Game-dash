import { IconType } from "react-icons";
import { Card } from "@/components/ui/card";
import { money } from "@/lib/format";

export function ReportCard({ label, value, icon: Icon, tone = "sky" }: { label: string; value: number; icon: IconType; tone?: "sky" | "emerald" | "amber" | "red" | "fuchsia" }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between"><div className="text-sm text-slate-400">{label}</div><Icon className={`text-${tone}-300`} /></div>
      <div className="mt-3 text-2xl font-black text-white">{money(value)}</div>
    </Card>
  );
}
