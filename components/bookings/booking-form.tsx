"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingForm() {
  return (
    <Card>
      <CardHeader><CardTitle>New booking</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {["Customer name", "Phone", "Simulator type", "Exact simulator", "Date", "Start time", "End time", "Tariff", "Prepayment", "Note"].map((label) => <div key={label} className="space-y-2"><Label>{label}</Label><Input /></div>)}
        <div className="col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Conflict warning appears here when selected time overlaps existing reservation.</div>
        <Button className="col-span-2">Create booking</Button>
      </CardContent>
    </Card>
  );
}
