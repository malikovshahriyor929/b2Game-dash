"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supportMessages } from "@/lib/mock-data";

export function SupportChat() {
  const [messages, setMessages] = useState(supportMessages);
  const [text, setText] = useState("");
  return (
    <div className="grid h-[calc(100vh-140px)] grid-cols-[240px_minmax(0,1fr)] gap-4">
      <Card className="p-3">
        {["News", "Support", "Tickets"].map((item, index) => <div key={item} className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm ${index === 1 ? "bg-sky-500/15 text-sky-200" : "text-slate-400"}`}>{item}{item === "Support" ? <Badge variant="destructive">1</Badge> : null}</div>)}
      </Card>
      <Card className="flex min-w-0 flex-col">
        <div className="border-b border-slate-800 p-4 font-semibold text-emerald-300">Support - Yao, Jonathan, Daniela online</div>
        <div className="flex-1 space-y-4 overflow-auto p-4 thin-scrollbar">
          {messages.map((msg, index) => <div key={index} className={`flex ${msg.own ? "justify-end" : "justify-start"}`}><div className={`max-w-[72%] rounded-2xl px-4 py-2 text-sm ${msg.own ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-100"}`}><div className="mb-1 text-xs opacity-70">{msg.from} - {msg.time}</div>{msg.text}</div></div>)}
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-3"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." /><Button onClick={() => { if (text) { setMessages((items) => [...items, { from: "Operator", text, time: "now", own: true }]); setText(""); } }}><FiSend /></Button></div>
      </Card>
    </div>
  );
}
