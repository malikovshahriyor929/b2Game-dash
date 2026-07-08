"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { money } from "@/lib/format";
import { AdminDeduction, AdminUser, fetchAdminDeductions, fetchAdmins } from "@/lib/admins-api";

function shortDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("uz-UZ");
}

export default function SalariesPage() {
  const { data: session } = useSession();
  const isSuper = session?.user?.role === "super_admin";
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [deductions, setDeductions] = useState<AdminDeduction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [adminRows, deductionRows] = await Promise.all([
        fetchAdmins(),
        fetchAdminDeductions(),
      ]);
      setAdmins(adminRows.filter((admin) => admin.role === "admin" || admin.role === "dev_admin"));
      setDeductions(deductionRows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Oylik/qarz ma'lumotlari yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuper) void refresh();
    else setLoading(false);
  }, [isSuper, refresh]);

  const adminRows = useMemo(() => admins.map((admin) => {
    const own = deductions.filter((item) => item.adminId === admin.id);
    const total = own.reduce((sum, item) => sum + item.amount, 0);
    const latest = own[0];
    return { admin, total, count: own.length, latest };
  }).sort((a, b) => b.admin.penaltyTotal - a.admin.penaltyTotal || b.total - a.total), [admins, deductions]);

  const totals = useMemo(() => ({
    outstanding: admins.reduce((sum, admin) => sum + admin.penaltyTotal, 0),
    records: deductions.length,
    adminsWithDebt: admins.filter((admin) => admin.penaltyTotal > 0).length,
  }), [admins, deductions]);

  if (!isSuper) {
    return (
      <div>
        <PageHeader title="Oylik va qarzlar" description="Faqat super admin uchun." />
        <Card className="p-6 text-sm text-slate-400">Bu bo'lim faqat super admin uchun.</Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Oylik va qarzlar" description="Adminlar oyligidan qirqiladigan qarzlar va oxirgi yozuvlar." />
        <Button variant="secondary" onClick={() => void refresh()}><FiRefreshCw /> Yangilash</Button>
      </div>

      {loading ? (
        <>
          <StatCardsSkeleton count={3} className="mb-4" />
          <TableSkeleton rows={6} cols={6} />
        </>
      ) : (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Qoldiq qarz</div>
              <div className="mt-1 text-2xl font-black text-red-200">{money(totals.outstanding)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Qarz yozuvlari</div>
              <div className="mt-1 text-2xl font-black text-white">{totals.records} ta</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Qarzdor adminlar</div>
              <div className="mt-1 text-2xl font-black text-amber-200">{totals.adminsWithDebt} ta</div>
            </Card>
          </div>

          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Yozuvlar</TableHead>
                <TableHead>Oxirgi sabab</TableHead>
                <TableHead>Oxirgi sana</TableHead>
                <TableHead className="text-right">Qoldiq qarz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRows.map(({ admin, total, count, latest }) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="font-semibold text-white">{admin.name}</div>
                    <div className="text-xs text-slate-500">{admin.email}</div>
                  </TableCell>
                  <TableCell><Badge variant={count ? "warning" : "muted"}>{count} ta</Badge></TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-300">{latest?.source || latest?.note || "-"}</TableCell>
                  <TableCell className="text-slate-400">{shortDate(latest?.createdAt ?? "")}</TableCell>
                  <TableCell className={`text-right font-semibold ${admin.penaltyTotal > 0 ? "text-red-300" : "text-slate-500"}`}>{admin.penaltyTotal > 0 ? money(admin.penaltyTotal) : "-"}</TableCell>
                </TableRow>
              ))}
              {adminRows.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Adminlar yo'q</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
