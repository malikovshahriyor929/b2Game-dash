"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { FiCreditCard, FiDollarSign, FiEdit2, FiKey, FiList, FiMonitor, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { money } from "@/lib/format";
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  AdminBranch,
  AdminDeduction,
  AdminDeductionType,
  AdminRole,
  AdminUser,
  AssignableSimulator,
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  fetchAdminDeductions,
  fetchAssignableSimulators,
  fetchBranches,
  payAdminPenalty,
  setAdminSimulators,
  updateAdmin,
} from "@/lib/admins-api";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  branchId: string;
  isActive: boolean;
};

const emptyForm: FormState = { name: "", email: "", password: "", role: "admin", branchId: "", isActive: true };

// admin and dev_admin are tied to a branch (and get simulator assignments);
// super_admin and dev_super_admin are global.
const branchScopedRole = (role: AdminRole) => role === "admin" || role === "dev_admin";
const roleLabel = (role: AdminRole) =>
  role === "dev_super_admin" ? "Dev super admin" : role === "dev_admin" ? "Dev admin" : role === "super_admin" ? "Super admin" : "Admin";
const deductionLabel = (type: AdminDeductionType | "all") =>
  type === "salary_advance" ? "Avans"
  : type === "personal_cash" ? "Shaxsiy"
  : type === "fine" ? "Jarima"
  : type === "damage" ? "Zarar"
  : type === "shortage" ? "Kamomad"
  : type === "other" ? "Boshqa"
  : "Hammasi";
const deductionTypes: Array<AdminDeductionType | "all"> = ["all", "salary_advance", "personal_cash", "fine", "damage", "shortage", "other"];

export default function AdminsPage() {
  const { data: session } = useSession();
  const confirm = useConfirm();
  // Super admins (incl. dev_super_admin) reach this page and manage every account,
  // including the hidden developer roles.
  const isSuper = session?.user?.role === "super_admin";

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [simulators, setSimulators] = useState<AssignableSimulator[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAdmin, setAssignAdmin] = useState<AdminUser | null>(null);
  const [assignSelected, setAssignSelected] = useState<Set<string>>(new Set());
  const [penaltyAdmin, setPenaltyAdmin] = useState<AdminUser | null>(null);
  const [penaltyForm, setPenaltyForm] = useState({ amount: "", method: "cash" as "cash" | "card" | "qr", received: "", note: "" });
  const [deductionAdmin, setDeductionAdmin] = useState<AdminUser | null>(null);
  const [deductionType, setDeductionType] = useState<AdminDeductionType | "all">("all");
  const [deductions, setDeductions] = useState<AdminDeduction[]>([]);
  const [deductionsLoading, setDeductionsLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [adminRows, branchRows, simRows] = await Promise.all([fetchAdmins(), fetchBranches(), fetchAssignableSimulators()]);
      setAdmins(adminRows);
      setBranches(branchRows);
      setSimulators(simRows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuper) void refresh();
    else setLoading(false);
  }, [isSuper, refresh]);

  const assignedCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const sim of simulators) {
      for (const adminId of sim.assignedAdminIds) counts.set(adminId, (counts.get(adminId) ?? 0) + 1);
    }
    return counts;
  }, [simulators]);

  const singleBranch = branches.length <= 1;

  const branchName = useCallback((id: string | null) => (id ? branches.find((b) => b.id === id)?.name ?? "—" : "—"), [branches]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? "" });
    setFormOpen(true);
  }

  function openEdit(admin: AdminUser) {
    setEditingId(admin.id);
    setForm({ name: admin.name, email: admin.email, password: "", role: admin.role, branchId: admin.branchId ?? "", isActive: admin.isActive });
    setFormOpen(true);
  }

  async function submitForm() {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name || !email) return toast.error("Ism va email kerak");
    if (!editingId && form.password.length < 6) return toast.error("Parol kamida 6 ta belgi");
    if (form.password && form.password.length < 6) return toast.error("Parol kamida 6 ta belgi");
    if (branchScopedRole(form.role) && !form.branchId) return toast.error("Admin uchun filial tanlang");

    const payload = {
      name,
      email,
      role: form.role,
      branch_id: branchScopedRole(form.role) ? form.branchId : null,
      is_active: form.isActive,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingId) {
        await updateAdmin(editingId, payload);
        toast.success("Admin yangilandi");
      } else {
        await createAdmin(payload);
        toast.success("Admin qo'shildi");
      }
      setFormOpen(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Saqlab bo'lmadi");
    }
  }

  async function remove(admin: AdminUser) {
    if (admin.id === session?.user?.id) return toast.error("O'zingizni o'chira olmaysiz");
    const ok = await confirm({
      title: "Admin o'chirilsinmi?",
      description: `${admin.name} o'chiriladi. Bu amalni qaytarib bo'lmaydi.`,
      confirmLabel: "O'chirish",
      tone: "destructive",
    });
    if (!ok) return;
    try {
      await deleteAdmin(admin.id);
      toast.success("O'chirildi");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "O'chirib bo'lmadi");
    }
  }

  function openAssign(admin: AdminUser) {
    setAssignAdmin(admin);
    setAssignSelected(new Set(simulators.filter((s) => s.assignedAdminIds.includes(admin.id)).map((s) => s.id)));
    setAssignOpen(true);
  }

  function toggleSimulator(id: string) {
    setAssignSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveAssignments() {
    if (!assignAdmin) return;
    try {
      await setAdminSimulators(assignAdmin.id, [...assignSelected]);
      toast.success("Simulyatorlar biriktirildi");
      setAssignOpen(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Biriktirib bo'lmadi");
    }
  }

  function openPenaltyPay(admin: AdminUser) {
    setPenaltyAdmin(admin);
    setPenaltyForm({ amount: String(Math.round(admin.penaltyTotal)), method: "cash", received: String(Math.round(admin.penaltyTotal)), note: "" });
  }

  async function openDeductions(admin: AdminUser) {
    setDeductionAdmin(admin);
    setDeductionType("all");
    setDeductionsLoading(true);
    try {
      const rows = await fetchAdminDeductions({ branchId: admin.branchId ?? undefined });
      setDeductions(rows.filter((row) => row.adminId === admin.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ushlanmalarni yuklab bo'lmadi");
    } finally {
      setDeductionsLoading(false);
    }
  }

  async function changeDeductionType(type: AdminDeductionType | "all") {
    if (!deductionAdmin) return;
    setDeductionType(type);
    setDeductionsLoading(true);
    try {
      const rows = await fetchAdminDeductions({ branchId: deductionAdmin.branchId ?? undefined, type });
      setDeductions(rows.filter((row) => row.adminId === deductionAdmin.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ushlanmalarni yuklab bo'lmadi");
    } finally {
      setDeductionsLoading(false);
    }
  }

  async function submitPenaltyPay() {
    if (!penaltyAdmin) return;
    const amount = Number(penaltyForm.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Summa kiriting");
    if (amount > penaltyAdmin.penaltyTotal) return toast.error("Summa jarima qoldig'idan katta");
    const received = Number(penaltyForm.received || 0);
    if (penaltyForm.method === "cash" && received < amount) return toast.error("Berilgan naqd summa kam");
    try {
      await payAdminPenalty(penaltyAdmin.id, {
        method: penaltyForm.method,
        cash_amount: penaltyForm.method === "cash" ? amount : 0,
        card_amount: penaltyForm.method === "card" ? amount : 0,
        qr_amount: penaltyForm.method === "qr" ? amount : 0,
        received_amount: penaltyForm.method === "cash" ? received : undefined,
        change_amount: penaltyForm.method === "cash" ? Math.max(received - amount, 0) : 0,
        note: penaltyForm.note.trim() || undefined,
      });
      toast.success("Jarima to'lovi qabul qilindi");
      setPenaltyAdmin(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Jarima to'lovini saqlab bo'lmadi");
    }
  }

  if (!isSuper) {
    return (
      <div>
        <PageHeader title="Adminlar" description="Faqat super admin uchun." />
        <Card className="p-6 text-sm text-slate-400">Bu bo'lim faqat super admin uchun.</Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Adminlar" description="Adminlarni boshqarish, parol va simulyatorlarga biriktirish." />
        <Button onClick={openCreate}><FiPlus /> Admin qo'shish</Button>
      </div>

      {loading ? (
        <>
          <StatCardsSkeleton count={3} className="mb-4" />
          <TableSkeleton rows={6} cols={6} />
        </>
      ) : (
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Simulyatorlar</TableHead>
              <TableHead>Jarima</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-semibold text-white">{admin.name}</TableCell>
                <TableCell className="text-slate-300">{admin.email}</TableCell>
                <TableCell><Badge variant={branchScopedRole(admin.role) ? "muted" : "vip"}>{roleLabel(admin.role)}</Badge></TableCell>
                <TableCell className="text-slate-300">{branchScopedRole(admin.role) ? branchName(admin.branchId) : "Barchasi"}</TableCell>
                <TableCell>{branchScopedRole(admin.role) ? `${assignedCount.get(admin.id) ?? 0} ta` : "—"}</TableCell>
                <TableCell className={admin.penaltyTotal > 0 ? "font-semibold text-red-300" : "text-slate-500"}>{admin.penaltyTotal > 0 ? money(admin.penaltyTotal) : "—"}</TableCell>
                <TableCell><Badge variant={admin.isActive ? "success" : "destructive"}>{admin.isActive ? "Faol" : "Bloklangan"}</Badge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    {branchScopedRole(admin.role) ? <IconButton tooltip="Ushlanmalar ro'yxati" variant="secondary" onClick={() => openDeductions(admin)}><FiList /></IconButton> : null}
                    {admin.penaltyTotal > 0 && branchScopedRole(admin.role) ? <IconButton tooltip="Qarz to'landi" variant="success" onClick={() => openPenaltyPay(admin)}><FiDollarSign /></IconButton> : null}
                    {branchScopedRole(admin.role) ? <IconButton tooltip="Simulyator biriktirish" variant="secondary" onClick={() => openAssign(admin)}><FiMonitor /></IconButton> : null}
                    <IconButton tooltip="Tahrirlash / parol" variant="secondary" onClick={() => openEdit(admin)}><FiEdit2 /></IconButton>
                    <IconButton tooltip="O'chirish" variant="destructive" disabled={admin.id === session?.user?.id} onClick={() => remove(admin)}><FiTrash2 /></IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-slate-500">Admin yo'q</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      )}

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Adminni tahrirlash" : "Yangi admin"}</DialogTitle>
            <DialogDescription>{editingId ? "Ma'lumotlarni yangilang. Parolni o'zgartirmasangiz bo'sh qoldiring." : "Yangi admin yarating."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Ism</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="To'liq ism" /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@b2game.uz" /></div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{editingId ? "Yangi parol (ixtiyoriy)" : "Parol"}</Label>
              <div className="relative">
                <FiKey className="absolute left-3 top-3 text-slate-500" />
                <Input className="pl-9" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editingId ? "O'zgartirmaslik uchun bo'sh" : "Kamida 6 ta belgi"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role: role as FormState["role"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super admin</SelectItem>
                  <SelectItem value="dev_admin">Dev admin (yashirin)</SelectItem>
                  <SelectItem value="dev_super_admin">Dev super admin (yashirin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Holat</Label>
              <Select value={form.isActive ? "active" : "blocked"} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === "active" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="blocked">Bloklangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {branchScopedRole(form.role) && !singleBranch ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>Filial</Label>
                <Select value={form.branchId} onValueChange={(branchId) => setForm((f) => ({ ...f, branchId }))}>
                  <SelectTrigger><SelectValue placeholder="Filial tanlang" /></SelectTrigger>
                  <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Bekor</Button>
            <Button onClick={submitForm}>{editingId ? "Saqlash" : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign simulators dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Simulyator biriktirish</DialogTitle>
            <DialogDescription>{assignAdmin?.name} — qaysi simulyatorlarni boshqaradi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {simulators.length === 0 ? <p className="text-sm text-slate-500">Simulyator yo'q.</p> : null}
            {simulators.map((sim) => {
              const checked = assignSelected.has(sim.id);
              // Many-to-many: a simulator can belong to several admins at once.
              const otherCount = sim.assignedAdminIds.filter((id) => id !== assignAdmin?.id).length;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => toggleSimulator(sim.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${checked ? "border-sky-500 bg-sky-500/10" : "border-slate-800 hover:bg-slate-800/40"}`}
                >
                  <div>
                    <div className="font-semibold text-white">{sim.name} <span className="text-xs font-normal text-slate-500">({sim.zone === "vip" ? "Premium" : "Asosiy"})</span></div>
                    <div className="text-xs text-slate-500">{sim.branchName} · {sim.code}{otherCount ? ` · yana ${otherCount} adminda` : ""}</div>
                  </div>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? "border-sky-400 bg-sky-500 text-slate-950" : "border-slate-600"}`}>{checked ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <div className="mr-auto text-sm font-semibold text-slate-400">{assignSelected.size} ta tanlandi</div>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>Bekor</Button>
            <Button onClick={saveAssignments}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Penalty payment dialog */}
      <Dialog open={Boolean(penaltyAdmin)} onOpenChange={(open) => !open && setPenaltyAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jarima to'landi</DialogTitle>
            <DialogDescription>
              {penaltyAdmin?.name} jarima qoldig'i: {money(penaltyAdmin?.penaltyTotal ?? 0)}. To'lov kassaga kirim sifatida yoziladi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>To'lov turi</Label>
              <Select value={penaltyForm.method} onValueChange={(method) => setPenaltyForm((item) => ({ ...item, method: method as "cash" | "card" | "qr" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Naqd</SelectItem>
                  <SelectItem value="card">Karta</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summa</Label>
              <Input inputMode="numeric" value={penaltyForm.amount} onChange={(event) => setPenaltyForm((item) => ({ ...item, amount: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" />
            </div>
            {penaltyForm.method === "cash" ? (
              <div className="space-y-2">
                <Label>Berilgan naqd</Label>
                <Input inputMode="numeric" value={penaltyForm.received} onChange={(event) => setPenaltyForm((item) => ({ ...item, received: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" />
                <div className="text-xs font-semibold text-slate-400">Qaytim: {money(Math.max(Number(penaltyForm.received || 0) - Number(penaltyForm.amount || 0), 0))}</div>
              </div>
            ) : null}
            <div className="space-y-2 sm:col-span-2">
              <Label>Izoh</Label>
              <Input value={penaltyForm.note} onChange={(event) => setPenaltyForm((item) => ({ ...item, note: event.target.value }))} placeholder="Masalan: naqd topshirdi" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPenaltyAdmin(null)}>Bekor</Button>
            <Button onClick={submitPenaltyPay}><FiCreditCard /> To'lovni saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin deduction list */}
      <Dialog open={Boolean(deductionAdmin)} onOpenChange={(open) => !open && setDeductionAdmin(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin ushlanmalari</DialogTitle>
            <DialogDescription>
              {deductionAdmin?.name} bo'yicha oylikdan qirqiladigan rasxodlar, jarimalar va kamomadlar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {deductionTypes.map((type) => (
              <Button key={type} size="sm" variant={deductionType === type ? "default" : "secondary"} onClick={() => void changeDeductionType(type)}>
                {deductionLabel(type)}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">Jami</div>
              <div className="mt-1 text-xl font-black text-white">{money(deductions.reduce((sum, item) => sum + item.amount, 0))}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">Ochiq</div>
              <div className="mt-1 text-xl font-black text-amber-200">{deductions.filter((item) => item.status === "open").length} ta</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">Type</div>
              <div className="mt-1 text-xl font-black text-sky-200">{deductionLabel(deductionType)}</div>
            </Card>
          </div>
          {deductionsLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sabab</TableHead>
                  <TableHead>Kim yozdi</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-slate-300">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("uz-UZ") : "—"}</TableCell>
                    <TableCell><Badge variant={item.type === "fine" || item.type === "shortage" ? "destructive" : "muted"}>{deductionLabel(item.type)}</Badge></TableCell>
                    <TableCell>
                      <div className="font-semibold text-white">{item.source || item.note || "Ushlanma"}</div>
                      {item.note && item.note !== item.source ? <div className="text-xs text-slate-500">{item.note}</div> : null}
                    </TableCell>
                    <TableCell className="text-slate-300">{item.createdByName || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-red-300">{money(item.amount)}</TableCell>
                  </TableRow>
                ))}
                {deductions.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Ushlanma yo'q</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeductionAdmin(null)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
