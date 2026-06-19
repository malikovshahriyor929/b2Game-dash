"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { FiCalendar, FiRotateCcw, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { backendDateTime } from "@/lib/datetime";
import { money } from "@/lib/format";
import { fetchLogs, LogCursor, LogFilters, LogRow } from "@/lib/logs-api";

const ACTION_TYPES = [
  { value: "all", label: "Barcha amallar" },
  { value: "session", label: "Sessiya" },
  { value: "payment", label: "To'lov" },
  { value: "repair", label: "Ta'mirlash" },
  { value: "booking", label: "Bron" },
  { value: "shift", label: "Smena" },
  { value: "login", label: "Kirish" },
  { value: "user", label: "Foydalanuvchi" },
  { value: "settings", label: "Sozlama" },
];

const PAYMENT_METHODS = [
  { value: "all", label: "Barcha to'lov turi" },
  { value: "cash", label: "Naqd" },
  { value: "card", label: "Karta" },
  { value: "qr", label: "QR / Bank" },
  { value: "balance", label: "Balans" },
  { value: "mixed", label: "Aralash" },
];

type FilterState = {
  search: string;
  actor: string;
  actionType: string;
  simulator: string;
  date: Date | undefined;
  paymentMethod: string;
};

const emptyFilters: FilterState = { search: "", actor: "", actionType: "all", simulator: "", date: undefined, paymentMethod: "all" };

function humanizeAction(action: string) {
  return action.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default function LogsPage() {
  const { selectedBranchId } = useDashboardStore();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [debounced, setDebounced] = useState<FilterState>(emptyFilters);

  const [items, setItems] = useState<LogRow[]>([]);
  const [cursor, setCursor] = useState<LogCursor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const reqIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const apiFilters = useMemo<LogFilters>(
    () => ({
      branchId: selectedBranchId ?? "all",
      search: debounced.search.trim() || undefined,
      actor: debounced.actor.trim() || undefined,
      actionType: debounced.actionType,
      simulator: debounced.simulator.trim() || undefined,
      date: debounced.date ? format(debounced.date, "yyyy-MM-dd") : undefined,
      paymentMethod: debounced.paymentMethod,
    }),
    [selectedBranchId, debounced],
  );

  // (Re)load the first page whenever filters or branch change.
  useEffect(() => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    fetchLogs(apiFilters, null)
      .then((page) => {
        if (reqIdRef.current !== reqId) return;
        setItems(page.items);
        setCursor(page.nextCursor);
        setHasMore(Boolean(page.nextCursor));
      })
      .catch((error) => {
        if (reqIdRef.current !== reqId) return;
        toast.error(error instanceof Error ? error.message : "Loglarni yuklab bo'lmadi");
        setItems([]);
        setCursor(null);
        setHasMore(false);
      })
      .finally(() => {
        if (reqIdRef.current === reqId) setLoading(false);
      });
  }, [apiFilters]);

  const loadMore = useCallback(() => {
    if (loadingMore || !cursor) return;
    const reqId = reqIdRef.current; // tie this page to the active filter set
    setLoadingMore(true);
    fetchLogs(apiFilters, cursor)
      .then((page) => {
        if (reqIdRef.current !== reqId) return; // filters changed mid-flight — drop stale page
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...page.items.filter((i) => !seen.has(i.id))];
        });
        setCursor(page.nextCursor);
        setHasMore(Boolean(page.nextCursor));
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Yuklab bo'lmadi"))
      .finally(() => setLoadingMore(false));
  }, [apiFilters, cursor, loadingMore]);

  // Infinite scroll — load the next page when the sentinel approaches the viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), { rootMargin: "240px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const hasActiveFilters =
    Boolean(filters.search || filters.actor || filters.simulator || filters.date) || filters.actionType !== "all" || filters.paymentMethod !== "all";

  const setField = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters((f) => ({ ...f, [key]: value })), []);

  return (
    <div>
      <PageHeader title="Loglar" description="Admin amallari, simulyator hodisalari, to'lovlar va ta'mirlash hisobotlari." />

      <Card className="mb-4">
        <CardContent className="space-y-3 pt-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" placeholder="Qidirish (amal, admin, simulyator, summa...)" value={filters.search} onChange={(e) => setField("search", e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Input placeholder="Admin" value={filters.actor} onChange={(e) => setField("actor", e.target.value)} />
            <Select value={filters.actionType} onValueChange={(v) => setField("actionType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACTION_TYPES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Simulyator" value={filters.simulator} onChange={(e) => setField("simulator", e.target.value)} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <FiCalendar className="mr-2 shrink-0" />
                  {filters.date ? format(filters.date, "dd.MM.yyyy") : <span className="text-slate-500">Sana</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={filters.date} onSelect={(d) => setField("date", d)} defaultMonth={filters.date} />
                {filters.date ? (
                  <div className="border-t border-slate-800 p-2">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setField("date", undefined)}>Sanani tozalash</Button>
                  </div>
                ) : null}
              </PopoverContent>
            </Popover>
            <Select value={filters.paymentMethod} onValueChange={(v) => setField("paymentMethod", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}><FiRotateCcw /> Filtrlarni tozalash</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {loading ? (
        <TableSkeleton rows={10} cols={6} />
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-slate-500">Log topilmadi</CardContent></Card>
      ) : (
        <>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Vaqt</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Amal</TableHead>
                <TableHead>Simulyator</TableHead>
                <TableHead>To&apos;lov</TableHead>
                <TableHead className="text-right">Summa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap text-slate-400">{backendDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-200">{item.operator}</div>
                    {item.role ? <div className="text-xs text-slate-500">{item.role}</div> : null}
                  </TableCell>
                  <TableCell className="text-slate-300">{humanizeAction(item.action)}</TableCell>
                  <TableCell className="text-slate-300">{item.simulator ?? "—"}</TableCell>
                  <TableCell>{item.paymentMethod ? <Badge variant="muted">{item.paymentMethod}</Badge> : "—"}</TableCell>
                  <TableCell className="text-right text-slate-300">{item.amount != null ? money(item.amount) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div ref={sentinelRef} className="py-6 text-center text-sm text-slate-500">
            {loadingMore ? "Yuklanmoqda..." : hasMore ? "Pastga aylantiring — yana yuklanadi" : `Jami ${items.length} ta log`}
          </div>
        </>
      )}
    </div>
  );
}
