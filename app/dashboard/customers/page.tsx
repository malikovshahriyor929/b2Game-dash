import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { customers } from "@/lib/mock-data";
import { money } from "@/lib/format";

export default function CustomersPage() {
  return (
    <div>
      <PageHeader title="Mijozlar" description="Customer profile, balance, bonus, spend and visit history." />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4">
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Balance</TableHead><TableHead>Bonus</TableHead><TableHead>Last visit</TableHead><TableHead>Total spent</TableHead><TableHead>Sessions</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{customers.map((item) => <TableRow key={item.phone}><TableCell>{item.name}<div className="text-xs text-slate-500">{item.phone}</div></TableCell><TableCell>{money(item.balance)}</TableCell><TableCell>{money(item.bonus)}</TableCell><TableCell>{item.lastVisit}</TableCell><TableCell>{money(item.totalSpent)}</TableCell><TableCell>{item.sessions}</TableCell><TableCell><Badge variant={item.status === "Debt" ? "destructive" : "success"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table>
        <Card><CardHeader><CardTitle>Customer details</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-300"><div className="rounded-xl bg-slate-950 p-3">Profile and balance history</div><div className="rounded-xl bg-slate-950 p-3">Session history</div><div className="rounded-xl bg-slate-950 p-3">Shop purchases</div></CardContent></Card>
      </div>
    </div>
  );
}
