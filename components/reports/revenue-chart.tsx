"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";

const hours = Array.from({ length: 12 }, (_, index) => index + 9);

function hourFromTime(value: string) {
  const hour = Number(value.split(":")[0]);
  return Number.isFinite(hour) ? hour : null;
}

function roundTick(value: number) {
  if (value <= 0) return 0;
  const step = value >= 100000 ? 50000 : value >= 50000 ? 25000 : 10000;
  return Math.ceil(value / step) * step;
}

export function RevenueChart({ title = "Hourly revenue chart" }: { title?: string }) {
  const { revenueEvents } = useDashboardStore();
  const hourly = hours.map((hour) => ({
    hour,
    amount: revenueEvents.reduce((sum, event) => (hourFromTime(event.time) === hour ? sum + event.amount : sum), 0),
  }));
  const total = hourly.reduce((sum, item) => sum + item.amount, 0);
  const maxAmount = Math.max(...hourly.map((item) => item.amount), 0);
  const topTick = roundTick(maxAmount);
  const ticks = [topTick, Math.round(topTick * 0.66), Math.round(topTick * 0.33), 0];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <div className="mt-1 text-xs font-semibold text-slate-500">09:00 - 20:00 oralig'idagi tushum</div>
        </div>
        <div className="shrink-0 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-bold uppercase text-slate-500">Total</div>
          <div className="text-sm font-black text-sky-200">{money(total)}</div>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm font-semibold text-slate-500">Revenue data yo'q</div>
        ) : (
          <div className="grid h-72 grid-cols-[64px,1fr] gap-3">
            <div className="flex flex-col justify-between pb-8 pt-1 text-right text-[11px] font-semibold text-slate-500">
              {ticks.map((tick) => <span key={tick}>{tick ? money(tick).replace(" so'm", "") : "0"}</span>)}
            </div>
            <div className="relative min-w-0">
              <div className="absolute inset-x-0 top-0 h-px bg-slate-800" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-slate-800/70" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-slate-800/70" />
              <div className="absolute inset-x-0 bottom-8 h-px bg-slate-700" />
              <div className="absolute bottom-8 left-0 top-0 w-px bg-slate-700" />
              <div className="relative grid h-full grid-cols-12 items-end gap-2 pl-3 pr-1">
                {hourly.map((item) => {
                  const height = topTick ? Math.max((item.amount / topTick) * 100, item.amount ? 4 : 0) : 0;
                  return (
                    <div key={item.hour} className="flex h-full min-w-0 flex-col justify-end gap-2">
                      <div className="group flex min-h-0 flex-1 items-end">
                        <div
                          className="relative w-full rounded-t-lg bg-sky-500/80 transition hover:bg-sky-400"
                          style={{ height: `${height}%` }}
                          title={`${item.hour}:00 - ${money(item.amount)}`}
                        >
                          <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[11px] font-bold text-sky-100 ring-1 ring-slate-700 group-hover:block">
                            {money(item.amount)}
                          </span>
                        </div>
                      </div>
                      <span className="h-6 truncate text-center text-xs font-semibold text-slate-500">{item.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
