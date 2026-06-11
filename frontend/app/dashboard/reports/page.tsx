"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiShoppingBag,
  FiTrendingUp,
  FiTrendingDown,
  FiUser,
  FiClock,
  FiArrowUpRight,
  FiArrowDownRight,
  FiActivity,
} from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { ReportCard } from "@/components/reports/report-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { money } from "@/lib/format";
import { localDate } from "@/lib/datetime";
import { useDashboardStore } from "@/components/providers/dashboard-store";

function isoDate(date: Date) {
  return localDate(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

export default function ReportsPage() {
  const {
    loading,
    revenueEvents,
    lockUnlockLogs,
    barSales,
    cashTransactions,
    shifts,
  } = useDashboardStore();

  const [dateFilter, setDateFilter] = useState<string>("today");
  const [startDate, setStartDate] = useState<Date | undefined>(() => new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());
  const today = new Date();
  const todayIso = isoDate(today);
  const yesterdayIso = isoDate(addDays(today, -1));
  const weekStartIso = isoDate(startOfWeek(today));
  const weekEndIso = isoDate(addDays(startOfWeek(today), 6));
  const currentMonth = todayIso.slice(0, 7);

  function isDateInRange(dateStr: string) {
    if (dateFilter === "today") return dateStr === todayIso;
    if (dateFilter === "yesterday") return dateStr === yesterdayIso;
    if (dateFilter === "week") return dateStr >= weekStartIso && dateStr <= weekEndIso;
    if (dateFilter === "month") return dateStr.startsWith(currentMonth);
    if (dateFilter === "custom") {
      if (!startDate || !endDate) return false;
      const start = localDate(startDate);
      const end = localDate(endDate);
      return dateStr >= start && dateStr <= end;
    }
    return true;
  }

  const filteredRevenueEvents = revenueEvents.filter((event) => {
    const eventDate = event.date || todayIso;
    return isDateInRange(eventDate);
  });

  const filteredBarSales = barSales.filter((sale) => isDateInRange(sale.date));
  const filteredLocks = lockUnlockLogs.filter((log) => isDateInRange(log.date));
  const filteredCashTx = cashTransactions.filter((tx) => isDateInRange(tx.date));
  const filteredShifts = shifts.filter((s) => isDateInRange(s.date));

  // Calculations
  const totalRevenue = filteredRevenueEvents.reduce((sum, item) => sum + item.amount, 0);

  // Incomes (Prixod) vs Expenses (Rasxod)
  const totalIncomes = filteredCashTx.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredCashTx.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // Bar sales sum
  const barSalesSum = filteredBarSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Cashier discrepancies
  const totalDiscrepancy = filteredShifts.reduce((sum, s) => sum + (s.discrepancy || 0), 0);

  // Breakdown by payment methods for bar & cashier transactions
  const cashSales = filteredRevenueEvents
    .filter(e => e.source.toLowerCase().includes("naqd") || e.source.toLowerCase().includes("cash") || e.source.toLowerCase().includes("started") || e.source.toLowerCase().includes("stopped"))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const cardSales = filteredRevenueEvents
    .filter(e => e.source.toLowerCase().includes("karta") || e.source.toLowerCase().includes("card"))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const qrSales = filteredRevenueEvents
    .filter(e => e.source.toLowerCase().includes("qr"))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Hisobotlar & Otchotlar"
          description="Superadmin hisobot paneli: Kirim/Chiqim, Bar savdosi, Kassa smenalari va Lock/Unlock jurnallari."
        />
        
        {/* Date Filter Widget */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#172036]/60 p-2 shadow-lg backdrop-blur-md">
          <FiCalendar className="text-slate-400 ml-1" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-9 w-[160px] border-none bg-transparent text-sm font-semibold text-white focus:ring-0 text-left">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="today">Bugun</SelectItem>
              <SelectItem value="yesterday">Kecha</SelectItem>
              <SelectItem value="week">Shu hafta</SelectItem>
              <SelectItem value="month">Shu oy</SelectItem>
              <SelectItem value="custom">Boshqa muddat...</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
              />
              <span className="text-xs text-slate-500">to</span>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="End date"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <>
          <StatCardsSkeleton count={6} className="lg:grid-cols-3 xl:grid-cols-6" />
          <TableSkeleton rows={8} cols={3} />
        </>
      ) : (
      <>
      {/* Main Indicators Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <ReportCard label="Umumiy tushum" value={totalRevenue} icon={FiDollarSign} tone="sky" />
        <ReportCard label="Bar (Do'kon)" value={barSalesSum} icon={FiShoppingBag} tone="emerald" />
        <ReportCard label="Kirim (Prixod)" value={totalIncomes} icon={FiArrowUpRight} tone="emerald" />
        <ReportCard label="Chiqim (Rasxod)" value={totalExpenses} icon={FiArrowDownRight} tone="red" />
        <ReportCard label="Kassa Farqi" value={totalDiscrepancy} icon={FiActivity} tone={totalDiscrepancy < 0 ? "red" : "amber"} />
        <ReportCard label="Sof Foyda" value={totalRevenue} icon={FiTrendingUp} tone="fuchsia" />
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="moliyaviy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl p-1 bg-slate-950/50 border border-slate-850 sm:flex sm:w-fit mb-4">
          <TabsTrigger value="moliyaviy" className="text-xs font-bold sm:text-sm px-4 py-2">
            Moliyaviy Otchot
          </TabsTrigger>
          <TabsTrigger value="bar" className="text-xs font-bold sm:text-sm px-4 py-2">
            Bar Otchoti
          </TabsTrigger>
          <TabsTrigger value="locks" className="text-xs font-bold sm:text-sm px-4 py-2">
            Lock / Unlock
          </TabsTrigger>
          <TabsTrigger value="kassa" className="text-xs font-bold sm:text-sm px-4 py-2">
            Kassa & Smenalar
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Moliyaviy Otchot */}
        <TabsContent value="moliyaviy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2 border-slate-800 bg-[#172036]/40">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <FiActivity className="text-sky-400" /> Tushumlar Tarixi va Manbasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                  <Table className="min-w-max">
                    <TableHeader className="bg-slate-950/40 sticky top-0">
                      <TableRow className="whitespace-nowrap">
                        <TableHead>Sana & Vaqt</TableHead>
                        <TableHead>Tushum Manbasi</TableHead>
                        <TableHead className="text-right">Summa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRevenueEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-slate-500 font-semibold">
                            Ushbu muddat uchun tushumlar mavjud emas
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRevenueEvents.map((event) => (
                          <TableRow key={event.id} className="hover:bg-slate-900/30">
                            <TableCell className="text-slate-400 text-xs font-medium">
                              {event.date || todayIso} {event.time}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-200 capitalize">
                              {event.source}
                            </TableCell>
                            <TableCell className={`text-right font-black ${event.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {event.amount < 0 ? "-" : "+"}{money(Math.abs(event.amount))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-[#172036]/40">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <FiCreditCard className="text-emerald-400" /> To'lov Turlari Bo'yicha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-medium">Naqd Pul (Cash)</span>
                      <span className="font-bold text-slate-200">{money(Math.max(cashSales, 0))}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalRevenue ? Math.max((cashSales/totalRevenue)*100, 0) : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-medium">Karta (Card)</span>
                      <span className="font-bold text-slate-200">{money(Math.max(cardSales, 0))}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${totalRevenue ? Math.max((cardSales/totalRevenue)*100, 0) : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-medium">QR To'lovlar</span>
                      <span className="font-bold text-slate-200">{money(Math.max(qrSales, 0))}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalRevenue ? Math.max((qrSales/totalRevenue)*100, 0) : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950/60 p-4 space-y-2.5 text-xs text-slate-400">
                  <div className="flex justify-between"><span>Jami Tushum:</span><b className="text-slate-200">{money(totalRevenue)}</b></div>
                  <div className="flex justify-between"><span>Kirimlar (Prixod):</span><b className="text-emerald-400">+{money(totalIncomes)}</b></div>
                  <div className="flex justify-between"><span>Chiqimlar (Rasxod):</span><b className="text-rose-400">-{money(totalExpenses)}</b></div>
                  <div className="border-t border-slate-800 my-1 pt-2 flex justify-between font-bold text-sm">
                    <span className="text-slate-300">Sof foyda:</span>
                    <span className="text-white">{money(totalRevenue + totalIncomes - totalExpenses)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Bar Otchoti */}
        <TabsContent value="bar" className="space-y-4">
          <Card className="border-slate-800 bg-[#172036]/40">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FiShoppingBag className="text-emerald-400" /> Bar va Do'kon Savdolari Jurnali
              </CardTitle>
              <Badge variant="success" className="px-2.5 py-1 text-xs">Savdo: {money(barSalesSum)}</Badge>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-slate-950/40 sticky top-0">
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Sana & Vaqt</TableHead>
                      <TableHead>Sotuvchi (Operator)</TableHead>
                      <TableHead>Mahsulotlar</TableHead>
                      <TableHead>To'lov Usuli</TableHead>
                      <TableHead className="text-right">Jami Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBarSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-semibold">
                          Ushbu muddat uchun bar savdosi jurnali mavjud emas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBarSales.map((sale) => (
                        <TableRow key={sale.id} className="hover:bg-slate-900/30">
                          <TableCell className="text-slate-400 text-xs font-medium">
                            {sale.date} {sale.time}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-200">
                            {sale.operator}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-slate-300 text-sm">
                            {sale.items.map((it) => `${it.name} (${it.qty}x)`).join(", ")}
                          </TableCell>
                          <TableCell>
                            <Badge className="font-bold text-[10px]" variant={sale.paymentMethod === "Naqd" ? "muted" : "success"}>
                              {sale.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-black text-white">
                            {money(sale.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Lock / Unlock */}
        <TabsContent value="locks" className="space-y-4">
          <Card className="border-slate-800 bg-[#172036]/40">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FiLock className="text-sky-400" /> Simulatorlarni Bloklash (Lock/Unlock) Jurnali
              </CardTitle>
              <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 text-xs">
                Hodisalar: {filteredLocks.length} ta
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-slate-950/40 sticky top-0">
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Sana & Vaqt</TableHead>
                      <TableHead>Konsol / Simulator</TableHead>
                      <TableHead>Operator (Admin)</TableHead>
                      <TableHead>Harakat turi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500 font-semibold">
                          Ushbu muddat uchun bloklash hodisalari qayd etilmagan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocks.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-900/30">
                          <TableCell className="text-slate-400 text-xs font-medium">
                            {log.date} {log.time}
                          </TableCell>
                          <TableCell className="font-bold text-slate-200">
                            {log.simulator}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            {log.operator}
                          </TableCell>
                          <TableCell>
                            {log.action === "lock" ? (
                              <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">
                                <FiLock className="inline mr-1" /> LOCK (Bloklandi)
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                <FiUnlock className="inline mr-1" /> UNLOCK (Ochildi)
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Kassa & Smenalar */}
        <TabsContent value="kassa" className="space-y-6">
          {/* Shifts Section */}
          <Card className="border-slate-800 bg-[#172036]/40">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FiClock className="text-sky-400" /> Admin Smenalari Tarixi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-slate-950/40 sticky top-0">
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Sana</TableHead>
                      <TableHead>Admin (Operator)</TableHead>
                      <TableHead>Smena turi</TableHead>
                      <TableHead>Yopilgan vaqti</TableHead>
                      <TableHead>Kassa Boshlang'ich</TableHead>
                      <TableHead>Kutilgan Naqd</TableHead>
                      <TableHead>Haqiqiy Naqd</TableHead>
                      <TableHead>Farq (Discrepancy)</TableHead>
                      <TableHead>Smena holati</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShifts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500 font-semibold">
                          Ushbu muddat uchun smenalar tarixi topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredShifts.map((s) => (
                        <TableRow key={s.id} className="hover:bg-slate-900/30">
                          <TableCell className="text-slate-400 text-xs font-semibold">{s.date}</TableCell>
                          <TableCell className="font-bold text-slate-200">{s.operator}</TableCell>
                          <TableCell className="text-slate-300 text-xs font-medium">{s.shiftType}</TableCell>
                          <TableCell className="text-slate-400 text-xs">
                            {s.status === "open" ? "-" : `${s.closeTime}`}
                          </TableCell>
                          <TableCell className="text-slate-300 font-medium">{money(s.startingCash)}</TableCell>
                          <TableCell className="text-sky-300 font-bold">{s.expectedCash ? money(s.expectedCash) : "-"}</TableCell>
                          <TableCell className="text-white font-bold">{s.actualCash ? money(s.actualCash) : "-"}</TableCell>
                          <TableCell className={`font-black ${s.discrepancy && s.discrepancy < 0 ? "text-rose-400" : s.discrepancy && s.discrepancy > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                            {s.discrepancy !== undefined ? (s.discrepancy > 0 ? `+${money(s.discrepancy)}` : money(s.discrepancy)) : "0 UZS"}
                          </TableCell>
                          <TableCell>
                            {s.status === "open" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse font-bold text-[10px]">
                                OCHIQ
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px]">
                                YOPILGAN
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Cash In / Cash Out (Prixod & Rasxod) log */}
          <Card className="border-slate-800 bg-[#172036]/40">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FiArrowUpRight className="text-emerald-400" /> Kassa Prixod (Kirim) va Rasxod (Chiqim) Otchoti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-slate-950/40 sticky top-0">
                    <TableRow className="whitespace-nowrap">
                      <TableHead>Sana & Vaqt</TableHead>
                      <TableHead>Harakat turi</TableHead>
                      <TableHead>Kim boshqardi (Admin)</TableHead>
                      <TableHead>Tavsif / Sabab</TableHead>
                      <TableHead>To'lov turi</TableHead>
                      <TableHead className="text-right">Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCashTx.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-semibold">
                          Ushbu muddat uchun kirim/chiqim tranzaksiyalari mavjud emas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCashTx.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-slate-900/30">
                          <TableCell className="text-slate-400 text-xs">
                            {tx.date} {tx.time}
                          </TableCell>
                          <TableCell>
                            {tx.type === "income" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                KIRIM (Prixod)
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                                CHIQIM (Rasxod)
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-slate-200">
                            {tx.operator}
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm max-w-[240px] truncate">
                            {tx.source}
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs font-semibold">
                            {tx.paymentMethod}
                          </TableCell>
                          <TableCell className={`text-right font-black ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                            {tx.type === "income" ? "+" : "-"}{money(tx.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  );
}
