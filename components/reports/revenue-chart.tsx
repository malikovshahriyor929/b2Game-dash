import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [66, 42, 58, 80, 62, 92, 74, 108, 86, 121, 97, 130];

export function RevenueChart({ title = "Hourly revenue chart" }: { title?: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex h-56 items-end gap-3 border-b border-l border-slate-800 px-4">
          {data.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-sky-500/80" style={{ height: `${value}px` }} /><span className="text-xs text-slate-500">{9 + index}</span></div>)}
        </div>
      </CardContent>
    </Card>
  );
}
