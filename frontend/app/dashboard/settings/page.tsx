"use client";

import { useEffect, useState } from "react";
import { FiBell, FiCreditCard, FiKey, FiMap, FiPrinter, FiShield, FiSliders, FiTool, FiUsers } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";
import { backendGet } from "@/server/api";

const sections = [
  ["Klub ma'lumotlari", FiSliders], ["Zonalar", FiMap], ["Simulyator turlari", FiTool], ["To'lov usullari", FiCreditCard], ["Xodimlar", FiUsers], ["Rollar va ruxsatlar", FiShield], ["Printer", FiPrinter], ["Bildirishnomalar", FiBell], ["Mavzu", FiSliders],
] as const;

export default function SettingsPage() {
  const [settingsCount, setSettingsCount] = useState(0);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    void backendGet<Array<{ key: string }>>("/settings?branch_id=all")
      .then((rows) => setSettingsCount(rows.length))
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <PageHeader title="Sozlamalar" description="Klub sozlamalari, to'lov usullari, ruxsatlar va qurilma amallari." />
      <Tabs defaultValue="general"><TabsList className="max-w-full overflow-x-auto"><TabsTrigger value="general">Umumiy</TabsTrigger><TabsTrigger value="roles">Rollar</TabsTrigger><TabsTrigger value="shift">Smena jarayoni</TabsTrigger><TabsTrigger value="devices">Qurilmalar</TabsTrigger><TabsTrigger value="security">Xavfsizlik</TabsTrigger></TabsList>
        <TabsContent value="general"><div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">{sections.map(([label, Icon]) => <Card key={label} className="p-4"><Icon className="mb-3 text-2xl text-sky-300" /><div className="font-semibold">{label}</div><div className="mt-1 text-sm text-slate-500">{settingsCount} ta backend sozlama kaliti</div></Card>)}</div></TabsContent>
        <TabsContent value="roles"><div className="grid gap-3 md:grid-cols-2">{[
          ["Admin", "Faqat biriktirilgan filial", "Sessiyalar, bronlar, do'konni boshqarishi hamda tasdiqdan keyin ta'mirlash so'rashi/yakunlashi mumkin."],
          ["Super Admin", "Barcha filiallar", "Har bir filial/adminni kuzatishi, ta'mirlashni tasdiqlashi, tuzatishlarni tasdiqlashi va hisobotlar/sozlamalarni ko'rishi mumkin."],
        ].map(([role, scope, detail]) => <Card key={role} className="p-4"><Badge>{role}</Badge><div className="mt-4 space-y-2 text-sm text-slate-300"><div>{scope}</div><div>{detail}</div></div></Card>)}</div></TabsContent>
        <TabsContent value="shift"><Card className="grid gap-3 p-4 md:grid-cols-2"><div className="rounded-xl bg-slate-950 p-4"><b>Smena ochish oynasi</b><div className="mt-2 text-sm text-slate-400">admin, boshlang'ich kassa, ochilish vaqti</div></div><div className="rounded-xl bg-slate-950 p-4"><b>Smena yopish oynasi</b><div className="mt-2 text-sm text-slate-400">kutilgan kassa, haqiqiy kassa, karta, QR, qaytarish, X-hisobot, Z-hisobot</div></div></Card></TabsContent>
        <TabsContent value="devices"><Card className="p-4 text-slate-300">Qurilma holati, qayta yuklash navbati, printer holati va texnik izohlari.</Card></TabsContent>
        <TabsContent value="security">
          <Card className="max-w-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300"><FiKey className="text-xl" /></div>
              <div>
                <div className="font-semibold text-white">Parol</div>
                <div className="text-sm text-slate-400">Hisobingiz parolini xavfsiz tarzda o&apos;zgartiring.</div>
              </div>
            </div>
            <Button className="mt-4" onClick={() => setPasswordDialogOpen(true)}><FiKey /> Parolni o&apos;zgartirish</Button>
          </Card>
        </TabsContent>
      </Tabs>
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
}
