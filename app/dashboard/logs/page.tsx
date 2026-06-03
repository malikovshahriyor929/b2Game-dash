"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function LogsPage() {
  const { logs } = useDashboardStore();
  return (
    <div>
      <PageHeader title="Loglar" description="Admin actions, simulator events, payments and repair reports." />
      <Card className="mb-4"><CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-5"><Input placeholder="Admin" /><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Action type</SelectItem><SelectItem value="payment">Payment</SelectItem><SelectItem value="session">Session</SelectItem><SelectItem value="repair">Repair</SelectItem></SelectContent></Select><Input placeholder="Simulator" /><Input type="date" /><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Payment method</SelectItem><SelectItem value="cash">Naqd</SelectItem><SelectItem value="card">Karta</SelectItem><SelectItem value="qr">QR</SelectItem></SelectContent></Select></CardContent></Card>
      <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>Simulator</TableHead><TableHead>Payment</TableHead></TableRow></TableHeader><TableBody>{logs.map((item) => <TableRow key={item.id}><TableCell>{item.time}</TableCell><TableCell>{item.operator}</TableCell><TableCell>{item.action}</TableCell><TableCell>{item.simulator ?? "-"}</TableCell><TableCell>{item.paymentMethod ? <Badge>{item.paymentMethod}</Badge> : "-"}</TableCell></TableRow>)}</TableBody></Table>
    </div>
  );
}
