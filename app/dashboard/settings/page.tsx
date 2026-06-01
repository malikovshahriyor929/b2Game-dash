import { FiBell, FiCreditCard, FiMap, FiPrinter, FiShield, FiSliders, FiTool, FiUsers } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sections = [
  ["Club information", FiSliders], ["Zones", FiMap], ["Simulator types", FiTool], ["Payment methods", FiCreditCard], ["Employees", FiUsers], ["Roles and permissions", FiShield], ["Printer", FiPrinter], ["Notifications", FiBell], ["Theme", FiSliders],
] as const;

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Sozlamalar" description="Club setup, payment methods, permissions and device operations." />
      <Tabs defaultValue="general"><TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="roles">Roles</TabsTrigger><TabsTrigger value="shift">Shift flow</TabsTrigger><TabsTrigger value="devices">Devices</TabsTrigger></TabsList>
        <TabsContent value="general"><div className="grid grid-cols-3 gap-3">{sections.map(([label, Icon]) => <Card key={label} className="p-4"><Icon className="mb-3 text-2xl text-sky-300" /><div className="font-semibold">{label}</div><div className="mt-1 text-sm text-slate-500">Mock configuration panel</div></Card>)}</div></TabsContent>
        <TabsContent value="roles"><div className="grid grid-cols-4 gap-3">{["Admin", "Cashier", "Operator", "Technician"].map((role) => <Card key={role} className="p-4"><Badge>{role}</Badge><div className="mt-4 space-y-2 text-sm text-slate-300"><div>Simulator control</div><div>Reports visibility</div><div>Refund requires admin</div><div>Maintenance controls</div></div></Card>)}</div></TabsContent>
        <TabsContent value="shift"><Card className="grid grid-cols-2 gap-3 p-4"><div className="rounded-xl bg-slate-950 p-4"><b>Open shift modal</b><div className="mt-2 text-sm text-slate-400">operator, starting cash, open time</div></div><div className="rounded-xl bg-slate-950 p-4"><b>Close shift modal</b><div className="mt-2 text-sm text-slate-400">expected cash, actual cash, card, QR, refund, X-report, Z-report</div></div></Card></TabsContent>
        <TabsContent value="devices"><Card className="p-4 text-slate-300">Device status, reboot queue, printer state and technician notes.</Card></TabsContent>
      </Tabs>
    </div>
  );
}
