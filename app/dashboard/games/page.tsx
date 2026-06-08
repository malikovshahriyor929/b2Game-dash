"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiImage, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { RiGamepadLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { backendGet, backendPatch } from "@/lib/backend-client";

type GameStatus = "installed" | "ready" | "updating" | "disabled";
type GameZone = "Standard" | "VIP" | "Both";

type Game = {
  id: string;
  name: string;
  zone: GameZone;
  status: GameStatus;
  version: string;
  imageUrl: string;
};

const emptyForm = { name: "", zone: "Standard" as GameZone, status: "ready" as GameStatus, version: "", imageUrl: "" };

const statusLabels: Record<GameStatus, string> = {
  installed: "O'rnatilgan",
  ready: "Tayyor",
  updating: "Yangilanmoqda",
  disabled: "O'chirilgan",
};

const statusHelp: Record<GameStatus, string> = {
  installed: "O'rnatilgan, hali tayyor deb belgilanmagan",
  ready: "Sessiyalar uchun mavjud",
  updating: "Texnik xizmat yoki update ketmoqda",
  disabled: "Aktiv simulatorlarda ko'rinmaydi",
};

function statusVariant(status: GameStatus) {
  if (status === "ready") return "success";
  if (status === "updating") return "warning";
  if (status === "disabled") return "destructive";
  return "muted";
}

function GameImage({ src, name, className = "" }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = src.trim() && !failed;

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {showImage ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,#1f3b53,transparent_55%),linear-gradient(135deg,#0f172a,#020617)] text-sky-200">
          <FiImage className="text-4xl" />
          <span className="max-w-[70%] truncate text-xs font-semibold text-slate-400">Rasm yo'q</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/95 to-transparent" />
    </div>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<"all" | GameZone>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GameStatus>("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadGames() {
    const rows = await backendGet<Array<{ key: string; value: unknown }>>("/settings?branch_id=all");
    const setting = rows.find((row) => row.key === "games");
    setGames(Array.isArray(setting?.value) ? setting.value as Game[] : []);
  }

  function saveGames(next: Game[]) {
    setGames(next);
    void backendPatch("/settings", { settings: { games: next } }).catch(() => undefined);
  }

  useEffect(() => {
    void loadGames().catch(() => undefined);
  }, []);

  const stats = useMemo(() => ({
    total: games.length,
    ready: games.filter((game) => game.status === "ready").length,
    updating: games.filter((game) => game.status === "updating").length,
    disabled: games.filter((game) => game.status === "disabled").length,
  }), [games]);

  const visible = useMemo(() => games.filter((game) => {
    const matchesZone = zoneFilter === "all" || (zoneFilter === "Both" ? game.zone === "Both" : game.zone === zoneFilter || game.zone === "Both");
    const matchesStatus = statusFilter === "all" || game.status === statusFilter;
    const searchable = `${game.name} ${game.zone} ${game.status} ${game.version}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    return matchesZone && matchesStatus && matchesQuery;
  }), [games, query, statusFilter, zoneFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(game: Game) {
    setEditingId(game.id);
    setForm({ name: game.name, zone: game.zone, status: game.status, version: game.version, imageUrl: game.imageUrl });
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      saveGames(games.map((game) => (game.id === editingId ? { ...game, ...form, name: form.name.trim() } : game)));
    } else {
      saveGames([{ id: crypto.randomUUID(), ...form, name: form.name.trim() }, ...games]);
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function removeGame(id: string) {
    saveGames(games.filter((game) => game.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="O'yinlar" description="Simulator zonasi va holati bo'yicha game library." />
        <Button onClick={openCreate}><FiPlus /> O'yin qo'shish</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jami o'yinlar</div>
          <div className="mt-2 text-3xl font-black text-white">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tayyor</div>
          <div className="mt-2 text-3xl font-black text-emerald-200">{stats.ready}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Yangilanmoqda</div>
          <div className="mt-2 text-3xl font-black text-amber-200">{stats.updating}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">O'chirilgan</div>
          <div className="mt-2 text-3xl font-black text-red-200">{stats.disabled}</div>
        </Card>
      </div>

      <Card className="p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_180px_180px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nomi, zona, status yoki versiya bo'yicha qidirish..." />
          </div>
          <Select value={zoneFilter} onValueChange={(value) => setZoneFilter(value as typeof zoneFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha zonalar</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Both">Both only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha statuslar</SelectItem>
              <SelectItem value="ready">Tayyor</SelectItem>
              <SelectItem value="installed">O'rnatilgan</SelectItem>
              <SelectItem value="updating">Yangilanmoqda</SelectItem>
              <SelectItem value="disabled">O'chirilgan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {visible.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {visible.map((game) => (
            <Card key={game.id} className="group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-sky-400/50">
              <div className="relative">
                <GameImage src={game.imageUrl} name={game.name} className="aspect-[16/9]" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge variant={game.zone === "VIP" ? "vip" : "muted"}>{game.zone}</Badge>
                  <Badge variant={statusVariant(game.status)}>{statusLabels[game.status]}</Badge>
                </div>
                <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <Button size="icon" variant="secondary" aria-label={`Edit ${game.name}`} onClick={() => openEdit(game)}><FiEdit2 /></Button>
                  <Button size="icon" variant="destructive" aria-label={`Delete ${game.name}`} onClick={() => removeGame(game.id)}><FiTrash2 /></Button>
                </div>
              </div>
              <div className="space-y-4 p-4">
                <div className="min-w-0">
                  <div className="truncate text-xl font-black text-white">{game.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{statusHelp[game.status]}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-500">Versiya</div>
                    <div className="mt-1 truncate font-semibold text-slate-100">{game.version || "-"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-500">Zona</div>
                    <div className="mt-1 truncate font-semibold text-slate-100">{game.zone}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-3xl text-sky-300"><RiGamepadLine /></div>
          <div className="text-xl font-black text-white">O'yin topilmadi</div>
          <div className="max-w-md text-sm text-slate-400">Filterlarni o'zgartiring yoki rasm, status, versiya va zona bilan yangi o'yin qo'shing.</div>
          <Button onClick={openCreate}><FiPlus /> O'yin qo'shish</Button>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "O'yinni tahrirlash" : "O'yin qo'shish"}</DialogTitle>
            <DialogDescription>{editingId ? "Rasm, zona, versiya va holatini yangilang." : "Cover rasm bilan yangi game library elementi yarating."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-[260px,1fr]">
            <div className="space-y-3">
              <Label>Rasm preview</Label>
              <GameImage src={form.imageUrl} name={form.name || "Game cover"} className="aspect-[4/3] rounded-2xl border border-slate-800" />
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
                Rasm game kartasida chiqadi va adminlarga kerakli o'yinni tezroq topishga yordam beradi.
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>O'yin nomi</Label>
                <Input value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} placeholder="O'yin nomi" />
              </div>
              <div className="space-y-2">
                <Label>Zona</Label>
                <Select value={form.zone} onValueChange={(value) => setForm((item) => ({ ...item, zone: value as GameZone }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Standard", "VIP", "Both"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((item) => ({ ...item, status: value as GameStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["ready", "installed", "updating", "disabled"].map((item) => <SelectItem key={item} value={item}>{statusLabels[item as GameStatus]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Versiya</Label>
                <Input value={form.version} onChange={(event) => setForm((item) => ({ ...item, version: event.target.value }))} placeholder="1.0" />
              </div>
              <div className="space-y-2">
                <Label>Rasm URL</Label>
                <Input value={form.imageUrl} onChange={(event) => setForm((item) => ({ ...item, imageUrl: event.target.value }))} placeholder="https://..." />
              </div>
              <Button className="sm:col-span-2" type="submit" disabled={!form.name.trim()}><FiPlus /> {editingId ? "Saqlash" : "Yaratish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
