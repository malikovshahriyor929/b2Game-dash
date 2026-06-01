import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TicketForm() {
  return (
    <Card>
      <CardHeader><CardTitle>Create ticket</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Title</Label><Input /></div>
        <div className="space-y-2"><Label>Simulator</Label><Input placeholder="RACE-01" /></div>
        <div className="space-y-2"><Label>Priority</Label><Select defaultValue="High"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low", "Medium", "High", "Critical"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Status</Label><Select defaultValue="Open"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Open", "In progress", "Waiting", "Solved", "Closed"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        <div className="col-span-2 space-y-2"><Label>Description</Label><Input /></div>
        <Button className="col-span-2">Create ticket</Button>
      </CardContent>
    </Card>
  );
}
