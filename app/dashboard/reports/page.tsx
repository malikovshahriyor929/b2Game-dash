"use client";

import { FiCreditCard, FiDollarSign, FiRefreshCw, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function ReportsPage() {
  const { revenue } = useDashboardStore();
  const rows = [["Naqd", 120000], ["Karta", 210000], ["QR", 90000], ["Balans", 25000], ["Refund", 0], ["Net profit", revenue], ["Debt", 45000]];
  return (
    <div>
      <PageHeader title="Hisobotlar" description="Daily revenue, shift, simulator usage, shop sales and payment breakdown." />
      <div className="mb-4 grid grid-cols-4 gap-3"><ReportCard label="Total" value={revenue} icon={FiDollarSign} /><ReportCard label="Card" value={210000} icon={FiCreditCard} /><ReportCard label="Shop" value={128000} icon={FiShoppingBag} /><ReportCard label="Refund" value={0} icon={FiRefreshCw} /></div>
      <Tabs defaultValue="daily"><TabsList><TabsTrigger value="daily">Daily revenue</TabsTrigger><TabsTrigger value="shift">Shift report</TabsTrigger><TabsTrigger value="usage">Simulator usage</TabsTrigger><TabsTrigger value="shop">Shop sales</TabsTrigger><TabsTrigger value="operators">Operator performance</TabsTrigger></TabsList>
        <TabsContent value="daily"><div className="grid grid-cols-[minmax(0,1fr)_420px] gap-4"><RevenueChart /><Table><TableHeader><TableRow><TableHead>Metric</TableHead><TableHead>Summa</TableHead></TableRow></TableHeader><TableBody>{rows.map(([label, value]) => <TableRow key={label as string}><TableCell>{label}</TableCell><TableCell>{money(value as number)}</TableCell></TableRow>)}</TableBody></Table></div></TabsContent>
        {["shift", "usage", "shop", "operators"].map((tab) => <TabsContent key={tab} value={tab}><RevenueChart title={`${tab} chart`} /></TabsContent>)}
      </Tabs>
    </div>
  );
}
