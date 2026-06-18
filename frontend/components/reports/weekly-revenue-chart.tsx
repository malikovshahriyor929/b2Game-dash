"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { backendGet } from "@/server/api";
import { money } from "@/lib/format";

type DayRevenue = { day: string; revenue: number };

const weekDayShort = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

function roundTick(value: number) {
  if (value <= 0) return 0;
  const step = value >= 1000000 ? 500000 : value >= 100000 ? 50000 : value >= 50000 ? 25000 : 10000;
  return Math.ceil(value / step) * step;
}

function dayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return { weekday: "", date: iso };
  const date = new Date(y, m - 1, d);
  return { weekday: weekDayShort[date.getDay()] ?? "", date: `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}` };
}

export function WeeklyRevenueChart({ title = "7 kunlik daromad" }: { title?: string }) {
  const [days, setDays] = useState<DayRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    backendGet<DayRevenue[]>("/dashboard/revenue-7d")
      .then((rows) => active && setDays(rows.map((row) => ({ day: String(row.day), revenue: Number(row.revenue ?? 0) }))))
      .catch(() => active && setDays([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const total = days.reduce((sum, item) => sum + item.revenue, 0);
  const maxAmount = Math.max(...days.map((item) => item.revenue), 0);
  const topTick = roundTick(maxAmount);
  const ticks = [topTick, Math.round(topTick * 0.66), Math.round(topTick * 0.33), 0];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <div className="mt-1 text-xs font-semibold text-slate-500">Oxirgi 7 kun (naqd + karta + QR)</div>
        </div>
        <div className="shrink-0 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-bold uppercase text-slate-500">Jami</div>
          <div className="text-sm font-black text-emerald-200">{money(total)}</div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm font-semibold text-slate-500">Yuklanmoqda...</div>
        ) : total === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm font-semibold text-slate-500">Revenue data yo'q</div>
        ) : (
          <div className="grid h-72 grid-cols-[64px,1fr] gap-3">
            <div className="flex flex-col justify-between pb-8 pt-1 text-right text-[11px] font-semibold text-slate-500">
              {ticks.map((tick, index) => <span key={index}>{tick ? money(tick).replace(" so'm", "") : "0"}</span>)}
            </div>
            <div className="relative min-w-0">
              <div className="absolute inset-x-0 top-0 h-px bg-slate-800" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-slate-800/70" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-slate-800/70" />
              <div className="absolute inset-x-0 bottom-8 h-px bg-slate-700" />
              <div className="absolute bottom-8 left-0 top-0 w-px bg-slate-700" />
              <div className="relative grid h-full grid-cols-7 items-end gap-2 pl-3 pr-1">
                {days.map((item) => {
                  const label = dayLabel(item.day);
                  const height = topTick ? Math.max((item.revenue / topTick) * 100, item.revenue ? 4 : 0) : 0;
                  return (
                    <div key={item.day} className="flex h-full min-w-0 flex-col justify-end gap-2">
                      <div className="group flex min-h-0 flex-1 items-end">
                        <div
                          className="relative w-full rounded-t-lg bg-emerald-500/80 transition hover:bg-emerald-400"
                          style={{ height: `${height}%` }}
                          title={`${label.date} - ${money(item.revenue)}`}
                        >
                          <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[11px] font-bold text-emerald-100 ring-1 ring-slate-700 group-hover:block">
                            {money(item.revenue)}
                          </span>
                        </div>
                      </div>
                      <span className="flex h-6 flex-col text-center text-[11px] font-semibold leading-tight text-slate-500">
                        <span className="text-slate-300">{label.weekday}</span>
                        <span>{label.date}</span>
                      </span>
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
