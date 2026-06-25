"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { FiAlertTriangle, FiCheckCircle, FiSearch } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";
import type { MaintenanceReviewStatus } from "@/types/simulator";

const STATUS_LABELS: Record<MaintenanceReviewStatus, string> = {
  open: "Ochiq",
  pending_review: "Tekshiruv kutilmoqda",
  cleared: "Haqiqiy",
  charged: "Jarima",
};

const STATUS_VARIANTS: Record<MaintenanceReviewStatus, "warning" | "vip" | "success" | "destructive"> = {
  open: "warning",
  pending_review: "vip",
  cleared: "success",
  charged: "destructive",
};

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Barcha holatlar" },
  { value: "pending_review", label: "Tekshiruv kutilmoqda" },
  { value: "open", label: "Ochiq" },
  { value: "charged", label: "Jarima" },
  { value: "cleared", label: "Haqiqiy" },
];

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return "0 daqiqa";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return [hours ? `${hours} soat` : null, mins ? `${mins} daqiqa` : null].filter(Boolean).join(" ") || "0 daqiqa";
}

export default function MaintenancePage() {
  const { data: session } = useSession();
  const { repairRequests, reviewMaintenance } = useDashboardStore();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isSuperAdmin = session?.user?.role === "super_admin" || session?.user?.role === "dev_super_admin";

  const stats = useMemo(() => ({
    pending: repairRequests.filter((item) => item.reviewStatus === "pending_review").length,
    chargedTotal: repairRequests.filter((item) => item.reviewStatus === "charged").reduce((sum, item) => sum + (item.chargeAmount ?? 0), 0),
    pendingTotal: repairRequests.filter((item) => item.reviewStatus === "pending_review").reduce((sum, item) => sum + (item.chargeAmount ?? 0), 0),
  }), [repairRequests]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return repairRequests
      .filter((item) => statusFilter === "all" || item.reviewStatus === statusFilter)
      .filter((item) => {
        const haystack = `${item.requestedByName ?? item.requestedBy} ${item.simulatorName} ${item.branchName} ${item.title}`.toLowerCase();
        return haystack.includes(text);
      });
  }, [repairRequests, query, statusFilter]);

  async function decide(id: string, decision: "cleared" | "charged", simulatorName: string, amount: number) {
    const ok = await confirm({
      title: decision === "charged" ? "Jarima qo'yilsinmi?" : "Haqiqiy ta'mir sifatida tasdiqlansinmi?",
      description: decision === "charged"
        ? `${simulatorName} bo'yicha ${money(amount)} adminning jarimasiga qo'shiladi.`
        : `${simulatorName} bo'yicha jarima qo'yilmaydi.`,
      confirmLabel: decision === "charged" ? "Jarima qo'yish" : "Tasdiqlash",
      tone: decision === "charged" ? "destructive" : "default",
    });
    if (ok) reviewMaintenance(id, decision);
  }

  if (!isSuperAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader title="Ta'mir nazorati" description="Faqat super admin uchun." />
        <Card className="p-6 text-sm text-slate-400">Bu sahifa faqat super admin uchun.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Ta'mir nazorati" description="Har bir maintenance: kim ochgan, qancha vaqt, tarif bo'yicha summa. Yolg'on ta'mirni 'Jarima' bilan admin hisobiga yozing." />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Tekshiruv kutmoqda</div><div className="mt-2 text-3xl font-black text-amber-200">{stats.pending}</div></Card>
        <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Kutilayotgan summa</div><div className="mt-2 text-2xl font-black text-sky-200">{money(stats.pendingTotal)}</div></Card>
        <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Jami jarima</div><div className="mt-2 text-2xl font-black text-red-200">{money(stats.chargedTotal)}</div></Card>
      </div>

      <Card className="p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Admin, simulyator, filial bo'yicha qidirish..." />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_FILTERS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>

      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Simulyator</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead>Ochilgan</TableHead>
            <TableHead>Yopilgan</TableHead>
            <TableHead>Davomiyligi</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length ? visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-white">{item.requestedByName ?? item.requestedBy}</TableCell>
              <TableCell>
                <div className="font-semibold text-slate-100">{item.simulatorName}</div>
                <div className="text-xs text-slate-500">{item.title}</div>
                {item.openedDuringSession ? <Badge variant="warning" className="mt-1">Sessiya vaqtida</Badge> : null}
              </TableCell>
              <TableCell>{item.branchName}</TableCell>
              <TableCell className="whitespace-nowrap text-sm text-slate-400">{item.openedAt ?? "-"}</TableCell>
              <TableCell className="whitespace-nowrap text-sm text-slate-400">{item.closedAt ?? "-"}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDuration(item.durationMinutes)}</TableCell>
              <TableCell className="whitespace-nowrap font-semibold text-sky-200">{money(item.chargeAmount ?? 0)}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANTS[item.reviewStatus]}>{STATUS_LABELS[item.reviewStatus]}</Badge></TableCell>
              <TableCell>
                <div className="flex justify-end gap-2 whitespace-nowrap">
                  {item.reviewStatus === "pending_review" ? (
                    <>
                      <IconButton tooltip="Haqiqiy — jarima yo'q" variant="success" onClick={() => decide(item.id, "cleared", item.simulatorName, item.chargeAmount ?? 0)}><FiCheckCircle /></IconButton>
                      <IconButton tooltip="Noto'g'ri — jarima qo'yish" variant="destructive" onClick={() => decide(item.id, "charged", item.simulatorName, item.chargeAmount ?? 0)}><FiAlertTriangle /></IconButton>
                    </>
                  ) : item.reviewStatus === "open" ? (
                    <span className="text-xs text-slate-500">Hali yopilmagan</span>
                  ) : (
                    <span className="text-xs text-slate-500">{item.reviewedByName ? `Tekshirdi: ${item.reviewedByName}` : "Tekshirilgan"}</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-slate-500">Maintenance yozuvlari topilmadi</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
