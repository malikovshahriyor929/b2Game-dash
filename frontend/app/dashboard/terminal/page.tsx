"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { FiPlay, FiRefreshCw, FiTerminal } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeletons";
import { RigRecord, TerminalCommandResult, listRigs, sendTerminalCommand } from "@/lib/rig-admin-api";

type RunRecord = TerminalCommandResult & {
  ranAt: string;
  rigLabel: string;
};

export default function TerminalPage() {
  const { data: session } = useSession();
  const allowed = session?.user?.role === "admin" && session.user.isDev;
  const [rigs, setRigs] = useState<RigRecord[]>([]);
  const [selectedRigId, setSelectedRigId] = useState("");
  const [command, setCommand] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<RunRecord[]>([]);

  const selectedRig = useMemo(() => rigs.find((rig) => rig.rig_id === selectedRigId), [rigs, selectedRigId]);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await listRigs();
      setRigs(rows);
      setSelectedRigId((current) => current || rows.find((rig) => rig.online)?.rig_id || rows[0]?.rig_id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Riglar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (allowed) void refresh();
    else setLoading(false);
  }, [allowed]);

  async function runCommand() {
    const text = command.trim();
    if (!selectedRigId) return toast.error("Rig tanlang");
    if (!text) return toast.error("Komanda kiriting");
    setRunning(true);
    try {
      const result = await sendTerminalCommand(selectedRigId, text, timeoutSeconds);
      const rigLabel = selectedRig?.label || selectedRigId;
      setHistory((items) => [{ ...result, ranAt: new Date().toISOString(), rigLabel }, ...items].slice(0, 20));
      if (result.ok) toast.success("Komanda bajarildi");
      else toast.error(result.timed_out ? "Komanda timeout bo'ldi" : `Exit code: ${result.return_code ?? "?"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Komanda yuborilmadi");
    } finally {
      setRunning(false);
    }
  }

  if (!allowed) {
    return (
      <div>
        <PageHeader title="Terminal" description="Faqat DevAdmin uchun." />
        <Card className="p-6 text-sm text-slate-400">Bu bo'lim faqat DevAdmin uchun.</Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Terminal" description="Agent, rig va simulyatorlarga masofadan komanda yuborish." />
        <Button variant="secondary" onClick={() => void refresh()} disabled={loading || running}><FiRefreshCw /> Yangilash</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,420px),1fr]">
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><FiTerminal /> Komanda</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rig</Label>
                <Select value={selectedRigId} onValueChange={setSelectedRigId}>
                  <SelectTrigger><SelectValue placeholder="Rig tanlang" /></SelectTrigger>
                  <SelectContent>
                    {rigs.map((rig) => (
                      <SelectItem key={rig.rig_id} value={rig.rig_id}>
                        {rig.label || rig.rig_id} · {rig.online ? "online" : "offline"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[1fr,120px] gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm">
                    <Badge variant={selectedRig?.online ? "success" : "destructive"}>{selectedRig?.online ? "Online" : "Offline"}</Badge>
                    <span className="truncate text-slate-400">{selectedRig?.branch_name ?? "—"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timeout</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={timeoutSeconds}
                    onChange={(event) => setTimeoutSeconds(Math.max(1, Math.min(Number(event.target.value || 30), 120)))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Terminal komanda</Label>
                <textarea
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder='Masalan: whoami yoki powershell -Command "Get-Process | Select -First 5"'
                  className="min-h-36 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500"
                />
              </div>
              <Button className="w-full" onClick={runCommand} disabled={running || !selectedRig?.online}>
                <FiPlay /> {running ? "Bajarilmoqda..." : "Yuborish"}
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {history.length === 0 ? (
              <Card className="p-6 text-sm text-slate-400">Hali komanda bajarilmadi.</Card>
            ) : history.map((item) => (
              <Card key={item.command_id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-sm font-semibold text-white">{item.command}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.rigLabel} · {new Date(item.ranAt).toLocaleString("uz-UZ")} · {item.duration_ms} ms</div>
                  </div>
                  <Badge variant={item.ok ? "success" : "destructive"}>{item.timed_out ? "Timeout" : item.return_code === null ? "Error" : `Exit ${item.return_code}`}</Badge>
                </div>
                <div className="grid gap-0 lg:grid-cols-2">
                  <OutputBlock title="stdout" text={item.stdout} />
                  <OutputBlock title="stderr" text={item.stderr} muted={!item.stderr} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OutputBlock({ title, text, muted }: { title: string; text: string; muted?: boolean }) {
  return (
    <div className="min-w-0 border-t border-slate-800 p-4 lg:border-t-0 lg:border-r last:lg:border-r-0">
      <div className="mb-2 text-xs font-bold uppercase text-slate-500">{title}</div>
      <pre className={`max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 font-mono text-xs ${muted ? "text-slate-600" : "text-slate-200"}`}>
        {text || "—"}
      </pre>
    </div>
  );
}
