"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiMessageCircle, FiPlus, FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { backendGet, backendPatch } from "@/lib/backend-client";

type TicketPriority = "Low" | "Medium" | "High" | "Critical";
type TicketStatus = "Open" | "In progress" | "Waiting" | "Solved" | "Closed";

type Ticket = {
  id: string;
  title: string;
  simulator: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
};

type Message = {
  from: string;
  text: string;
  time: string;
  own: boolean;
  ticketId?: string;
};

function now() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function statusVariant(status: TicketStatus) {
  if (status === "Solved" || status === "Closed") return "success";
  if (status === "Waiting") return "warning";
  if (status === "In progress") return "vip";
  return "destructive";
}

export function SupportWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", simulator: "", priority: "High" as TicketPriority, status: "Open" as TicketStatus, description: "" });

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);
  const visibleMessages = useMemo(() => messages.filter((message) => !selectedTicketId || !message.ticketId || message.ticketId === selectedTicketId), [messages, selectedTicketId]);
  const openCount = tickets.filter((ticket) => ticket.status !== "Closed" && ticket.status !== "Solved").length;

  function persist(nextTickets = tickets, nextMessages = messages) {
    void backendPatch("/settings", { settings: { support_tickets: nextTickets, support_messages: nextMessages } }).catch(() => undefined);
  }

  useEffect(() => {
    void backendGet<Array<{ key: string; value: unknown }>>("/settings?branch_id=all")
      .then((rows) => {
        const ticketSetting = rows.find((row) => row.key === "support_tickets");
        const messageSetting = rows.find((row) => row.key === "support_messages");
        const nextTickets = Array.isArray(ticketSetting?.value) ? ticketSetting.value as Ticket[] : [];
        setTickets(nextTickets);
        setSelectedTicketId(nextTickets[0]?.id ?? null);
        setMessages(Array.isArray(messageSetting?.value) ? messageSetting.value as Message[] : []);
      })
      .catch(() => undefined);
  }, []);

  function sendMessage() {
    const value = text.trim();
    if (!value) return;
    const nextMessages = [...messages, { from: "Admin", text: value, time: now(), own: true, ticketId: selectedTicketId ?? undefined }];
    setMessages(nextMessages);
    persist(tickets, nextMessages);
    setText("");
  }

  function createTicket(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.simulator.trim() || !form.description.trim()) return;
    const ticket: Ticket = {
      id: `B2-${Math.floor(200 + Math.random() * 800)}`,
      title: form.title.trim(),
      simulator: form.simulator.trim().toUpperCase(),
      priority: form.priority,
      status: form.status,
      description: form.description.trim(),
      createdAt: now(),
    };
    const nextTickets = [ticket, ...tickets];
    const nextMessages = [
      ...messages,
      { from: "Admin", text: `${ticket.simulator}: ${ticket.title}. ${ticket.description}`, time: ticket.createdAt, own: true, ticketId: ticket.id },
      { from: "Support Bot", text: `Ticket #${ticket.id} created and assigned to Super Admin monitoring.`, time: ticket.createdAt, own: false, ticketId: ticket.id },
    ];
    setTickets(nextTickets);
    setSelectedTicketId(ticket.id);
    setMessages(nextMessages);
    persist(nextTickets, nextMessages);
    setForm({ title: "", simulator: "", priority: "High", status: "Open", description: "" });
    setCreateOpen(false);
  }

  function updateSelectedStatus(status: TicketStatus) {
    if (!selectedTicketId) return;
    const nextTickets = tickets.map((ticket) => (ticket.id === selectedTicketId ? { ...ticket, status } : ticket));
    const nextMessages = [...messages, { from: "Support Bot", text: `Ticket status changed to ${status}.`, time: now(), own: false, ticketId: selectedTicketId }];
    setTickets(nextTickets);
    setMessages(nextMessages);
    persist(nextTickets, nextMessages);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="min-h-[260px] overflow-hidden">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">Tickets <Badge variant={openCount ? "destructive" : "success"}>{openCount}</Badge></span>
            <Button size="icon" onClick={() => setCreateOpen(true)} aria-label="Create ticket"><FiPlus /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          <button
            className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm", selectedTicketId === null ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800")}
            onClick={() => setSelectedTicketId(null)}
          >
            <span className="flex items-center gap-2"><FiMessageCircle /> General chat</span>
          </button>
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              className={cn("w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-800", selectedTicketId === ticket.id ? "bg-sky-500/15 text-sky-200" : "text-slate-300")}
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">#{ticket.id}</span>
                <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
              </div>
              <div className="mt-1 truncate text-xs text-slate-400">{ticket.simulator} - {ticket.title}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="flex min-h-[560px] min-w-0 flex-col overflow-hidden xl:h-[calc(100vh-220px)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
          <div>
            <div className="font-semibold text-emerald-300">{selectedTicket ? `#${selectedTicket.id} - ${selectedTicket.title}` : "Support - Yao, Jonathan, Daniela online"}</div>
            <div className="mt-1 text-xs text-slate-500">{selectedTicket ? `${selectedTicket.simulator} - ${selectedTicket.priority}` : "General operational support chat"}</div>
          </div>
          {selectedTicket ? (
            <Select value={selectedTicket.status} onValueChange={(value) => updateSelectedStatus(value as TicketStatus)}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{["Open", "In progress", "Waiting", "Solved", "Closed"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 thin-scrollbar">
          {visibleMessages.map((msg, index) => (
            <div key={`${msg.time}-${index}`} className={cn("flex", msg.own ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%] rounded-2xl px-4 py-2 text-sm md:max-w-[72%]", msg.own ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-100")}>
                <div className="mb-1 text-xs opacity-70">{msg.from} - {msg.time}</div>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-3">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder={selectedTicket ? `Message for #${selectedTicket.id}` : "Message..."}
          />
          <Button onClick={sendMessage} disabled={!text.trim()}><FiSend /></Button>
        </div>
      </Card>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create ticket</DialogTitle>
            <DialogDescription>Create an operational support ticket for a branch simulator or admin issue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createTicket} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(event) => setForm((item) => ({ ...item, title: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Simulator</Label><Input value={form.simulator} onChange={(event) => setForm((item) => ({ ...item, simulator: event.target.value }))} placeholder="LOGITECH-01" /></div>
            <div className="space-y-2"><Label>Priority</Label><Select value={form.priority} onValueChange={(value) => setForm((item) => ({ ...item, priority: value as TicketPriority }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low", "Medium", "High", "Critical"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm((item) => ({ ...item, status: value as TicketStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Open", "In progress", "Waiting", "Solved", "Closed"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(event) => setForm((item) => ({ ...item, description: event.target.value }))} /></div>
            <Button className="sm:col-span-2" type="submit" disabled={!form.title.trim() || !form.simulator.trim() || !form.description.trim()}><FiPlus /> Create ticket</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
