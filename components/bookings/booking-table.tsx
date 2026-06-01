import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookings } from "@/lib/mock-data";
import { money } from "@/lib/format";

export function BookingTable() {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Simulator</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Tariff</TableHead><TableHead>Prepay</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
      <TableBody>{bookings.map((item) => <TableRow key={item.id}><TableCell>{item.customerName}<div className="text-xs text-slate-500">{item.phone}</div></TableCell><TableCell>{item.simulatorId}</TableCell><TableCell>{item.date}</TableCell><TableCell>{item.startTime} - {item.endTime}</TableCell><TableCell>{item.tariff}</TableCell><TableCell>{money(item.prepayment)}</TableCell><TableCell><Badge variant="warning">{item.status}</Badge></TableCell></TableRow>)}</TableBody>
    </Table>
  );
}
