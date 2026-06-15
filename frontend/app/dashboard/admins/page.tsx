"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { FiEdit2, FiKey, FiMonitor, FiPlus, FiTrash2 } from "react-icons/fi";
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
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import {
  AdminBranch,
  AdminUser,
  AssignableSimulator,
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  fetchAssignableSimulators,
  fetchBranches,
  setAdminSimulators,
  updateAdmin,
} from "@/lib/admins-api";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
  branchId: string;
  isActive: boolean;
};

const emptyForm: FormState = { name: "", email: "", password: "", role: "admin", branchId: "", isActive: true };

export default function AdminsPage() {
  const { data: session } = useSession();
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
    if (form.role === "admin" && !form.branchId) return toast.error("Admin uchun filial tanlang");

    const payload = {
      name,
      email,
      role: form.role,
      branch_id: form.role === "super_admin" ? null : form.branchId,
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
    if (!window.confirm(`${admin.name} o'chirilsinmi?`)) return;
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
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-semibold text-white">{admin.name}</TableCell>
                <TableCell className="text-slate-300">{admin.email}</TableCell>
                <TableCell><Badge variant={admin.role === "super_admin" ? "vip" : "muted"}>{admin.role === "super_admin" ? "Super admin" : "Admin"}</Badge></TableCell>
                <TableCell className="text-slate-300">{admin.role === "super_admin" ? "Barchasi" : branchName(admin.branchId)}</TableCell>
                <TableCell>{admin.role === "super_admin" ? "—" : `${assignedCount.get(admin.id) ?? 0} ta`}</TableCell>
                <TableCell><Badge variant={admin.isActive ? "success" : "destructive"}>{admin.isActive ? "Faol" : "Bloklangan"}</Badge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    {admin.role === "admin" ? <IconButton tooltip="Simulyator biriktirish" variant="secondary" onClick={() => openAssign(admin)}><FiMonitor /></IconButton> : null}
                    <IconButton tooltip="Tahrirlash / parol" variant="secondary" onClick={() => openEdit(admin)}><FiEdit2 /></IconButton>
                    <IconButton tooltip="O'chirish" variant="destructive" disabled={admin.id === session?.user?.id} onClick={() => remove(admin)}><FiTrash2 /></IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-slate-500">Admin yo'q</TableCell></TableRow> : null}
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
                <Input className="pl-9" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editingId ? "O'zgartirmaslik uchun bo'sh" : "Kamida 6 ta belgi"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role: role as FormState["role"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super admin</SelectItem>
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
            {form.role === "admin" && !singleBranch ? (
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
                    <div className="font-semibold text-white">{sim.name} <span className="text-xs font-normal text-slate-500">({sim.zone === "vip" ? "Premium" : "Main"})</span></div>
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
    </div>
  );
}
