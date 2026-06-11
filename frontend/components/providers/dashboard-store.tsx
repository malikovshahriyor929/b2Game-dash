"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Booking } from "@/types/booking";
import { LogEntry, LockUnlockEntry } from "@/types/log";
import { OrderItem, Product, BarSale } from "@/types/product";
import { RepairErrorType, RepairPriority, RepairRequest, Simulator } from "@/types/simulator";
import { CashTransaction, Shift } from "@/types/report";
import { Branch } from "@/types/user";
import { backendDate, backendDateTime, backendTime, localDate, localDateTimeWithOffset } from "@/lib/datetime";
import { backendDelete, backendGet, backendPatch, backendPost, getBackendWsToken } from "@/server/api";
import {
  listRigs as fetchRigList,
  lockRig as lockAdminRig,
  mapBackendSimulatorRows,
  notifyRig as notifyAdminRig,
  pushRigUpdate as pushAdminRigUpdate,
  removeRig as removeAdminRig,
  RigRecord,
  unlockRig as unlockAdminRig,
} from "@/lib/rig-admin-api";

type StartPayload = { customerName: string; phone: string; tariff: string; tariffId?: string; customerId?: string; duration: number; amount: number; paymentStatus: "paid" | "unpaid"; paymentMethod?: string };
type PeriodFilter = "today" | "yesterday" | "week" | "month" | "year" | "custom";
type RepairPayload = { title: string; description: string; errorType: RepairErrorType; priority: RepairPriority; note?: string };
type RevenueEvent = { id: string; time: string; date?: string; amount: number; source: string; branchId?: string };
type PaymentMethod = "cash" | "card" | "qr" | "balance" | "mixed";
type PaymentPayload = {
  cash_amount: number;
  card_amount: number;
  qr_amount: number;
  balance_amount: number;
  received_amount?: number;
  change_amount?: number;
};

const fallbackBranch: Branch = { id: "default-branch", name: "Default branch" };


type DashboardStore = {
  loading: boolean;
  simulators: Simulator[];
  allSimulators: Simulator[];
  selectedId: string | null;
  selected?: Simulator;
  setSelectedId: (id: string | null) => void;
  revenue: number;
  revenueEvents: RevenueEvent[];
  logs: LogEntry[];
  lockUnlockLogs: LockUnlockEntry[];
  barSales: BarSale[];
  cashTransactions: CashTransaction[];
  shifts: Shift[];
  activeShift: Shift | null;
  repairRequests: RepairRequest[];
  products: Product[];
  order: OrderItem[];
  bookings: Booking[];
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  startSession: (id: string, payload: StartPayload) => void;
  addTime: (id: string, minutes: number, amount: number, method: string) => void;
  pay: (id: string, amount: number, method: string) => void;
  stopSession: (id: string, override?: boolean) => void;
  toggleLock: (id: string) => void;
  requestFix: (id: string, payload: RepairPayload) => void;
  approveRepair: (requestId: string) => void;
  rejectRepair: (requestId: string) => void;
  askRepairDetails: (requestId: string) => void;
  startFixing: (id: string) => void;
  markFixed: (id: string) => void;
  confirmFixed: (requestId: string) => void;
  rejectFix: (requestId: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;
  addProduct: (product: Product) => void;
  addProductByQr: (code: string) => Product | null;
  createProduct: (product: Omit<Product, "id">) => Promise<Product | null>;
  updateProduct: (id: string, product: Omit<Product, "id">) => Product | null;
  deleteProduct: (id: string) => void;
  recordCashierTransaction: (action: string, amount: number, method: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearOrder: () => void;
  payOrder: (attachTo?: string, paymentMethod?: string, customerId?: string, payment?: Partial<PaymentPayload>) => void;
  openShift: (operator: string, shiftType: "Kunduzgi (09:00 - 18:00)" | "Tungi (18:01 - 09:00)", startingCash: number) => void;
  closeShift: (actualCash: number, notes?: string) => void;
  addCashTransaction: (type: "income" | "expense", amount: number, source: string, method: string) => void;
  refreshRigs: () => void;
  notifyRig: (id: string, message: string) => void;
  pushRigUpdate: (id: string) => void;
  removeOfflineRig: (id: string) => void;
};


const StoreContext = createContext<DashboardStore | null>(null);

function now() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function shortDate(value?: string | null) {
  return backendDate(value);
}

function shortTime(value?: string | null) {
  return value ? backendTime(value) : now();
}

function timestampTime(value?: string | null) {
  return value ? shortTime(value) : undefined;
}

function numberValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function dateTimeFromParts(date: string, time: string) {
  return localDateTimeWithOffset(date, time);
}

function toApiPaymentMethod(method?: string): PaymentMethod {
  const value = (method ?? "").toLowerCase();
  if (value.includes("naqd") || value.includes("cash")) return "cash";
  if (value.includes("qr")) return "qr";
  if (value.includes("balance")) return "balance";
  if (value.includes("aralash") || value.includes("mixed")) return "mixed";
  return "card";
}

function splitPayment(amount: number, method: PaymentMethod): PaymentPayload {
  return {
    cash_amount: method === "cash" ? amount : 0,
    card_amount: method === "card" || method === "mixed" ? amount : 0,
    qr_amount: method === "qr" ? amount : 0,
    balance_amount: method === "balance" ? amount : 0,
  };
}

function productCategory(value?: string): Product["category"] {
  const text = (value ?? "").toLowerCase();
  if (text.includes("drink") || text.includes("ichim")) return "Ichimliklar";
  if (text.includes("food") || text.includes("burger")) return "Fast food";
  if (text.includes("energy")) return "Energy drink";
  if (text.includes("merch")) return "Merch";
  if (text.includes("promo")) return "Promo";
  if (text.includes("paket") || text.includes("tariff")) return "Paketlar";
  return "Snack";
}

function productIcon(name: string) {
  const text = name.toLowerCase();
  if (text.includes("burger") || text.includes("food")) return "burger";
  if (text.includes("water") || text.includes("cola") || text.includes("drink")) return "drink";
  if (text.includes("energy")) return "energy";
  if (text.includes("snack") || text.includes("chips") || text.includes("snicker")) return "snack";
  if (text.includes("pizza")) return "pizza";
  if (text.includes("hotdog")) return "hotdog";
  if (text.includes("coffee")) return "coffee";
  if (text.includes("cake")) return "cake";
  if (text.includes("cookie")) return "cookie";
  return "snack";
}

function rigRemainingSeconds(unlockUntil: string | null) {
  if (!unlockUntil) return 0;
  const diff = new Date(unlockUntil).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
}

function sessionRemainingSeconds(rig: RigRecord) {
  return Math.max(0, Math.floor(numberValue(rig.active_remaining_seconds)));
}

function rigStatus(rig: RigRecord): Simulator["status"] {
  if (["ready_to_play", "busy", "reserved", "unpaid", "broken", "repair_requested", "repair_approved", "fixing", "fixed_waiting_confirmation", "offline", "locked"].includes(rig.state)) {
    return rig.state as Simulator["status"];
  }
  if (!rig.online || rig.state === "Offline") return "offline";
  return rig.locked ? "ready_to_play" : "busy";
}

function rigType(rig: RigRecord): Simulator["zone"] {
  const text = `${rig.label} ${rig.hostname} ${rig.rig_id} ${rig.zone ?? ""}`.toLowerCase();
  return text.includes("moza") || text.includes("vip") ? "VIP" : "Standard";
}

function rigsToSimulators(rigs: RigRecord[], branchList: Branch[]) {
  return rigs.map((rig) => {
    const zone = rigType(rig);
    const status = rigStatus(rig);
    const hasSessionTimer = ["busy", "unpaid"].includes(status);
    const isOpen = rig.active_billing_mode === "open";
    // Open (VIP) sessions count up: the "remaining" field carries elapsed time so the card timer ticks upward.
    const elapsedSeconds = Math.max(0, Math.floor(numberValue(rig.active_elapsed_seconds)));
    const remainingSeconds = hasSessionTimer
      ? (isOpen ? elapsedSeconds : (sessionRemainingSeconds(rig) || rigRemainingSeconds(rig.unlock_until)))
      : 0;
    const branch = branchList.find((item) => item.id === rig.branch_id) ?? {
      id: rig.branch_id ?? branchList[0]?.id ?? fallbackBranch.id,
      name: rig.branch_name ?? branchList[0]?.name ?? fallbackBranch.name,
    };

    return {
      id: rig.simulator_id ?? rig.rig_id,
      name: rig.label || rig.hostname || rig.rig_id,
      type: zone,
      zone,
      branchId: branch.id,
      branchName: branch.name,
      status,
      deviceId: rig.rig_id,
      ipAddress: rig.hostname,
      currentUser: hasSessionTimer ? rig.active_customer_name || "Active rig" : undefined,
      phone: rig.active_phone ?? undefined,
      tariff: rig.active_tariff_name || "Rig Admin",
      startedAt: timestampTime(rig.active_started_at),
      remainingMinutes: Math.ceil(remainingSeconds / 60),
      remainingSeconds,
      billingMode: isOpen ? "open" : "fixed",
      hourlyRate: numberValue(rig.active_hourly_rate),
      elapsedSeconds: isOpen ? elapsedSeconds : undefined,
      accruedAmount: isOpen ? numberValue(rig.active_accrued_amount) : undefined,
      paidAmount: numberValue(rig.active_paid_amount),
      paymentStatus: rig.active_payment_mode === "postpaid" ? "unpaid" : "paid",
      orderItems: [],
      rigId: rig.rig_id,
      rigHostname: rig.hostname,
      rigVersion: rig.version,
      rigLatestVersion: rig.latest_version,
      rigNeedsUpdate: rig.needs_update,
      rigOnline: rig.online,
      rigUnlockUntil: rig.unlock_until,
      rigUpdateStatus: rig.update_status,
      rigLastSeen: rig.last_seen,
      currentSessionId: rig.current_session_id ?? rig.active_session_id,
      mapPosition: rig.map_position ?? undefined,
    } satisfies Simulator;
  });
}

function mapProduct(row: Record<string, unknown>): Product {
  const name = String(row.name ?? "Product");
  return {
    id: String(row.id),
    name,
    qrCode: String(row.barcode ?? row.qr_code ?? row.id),
    price: numberValue(row.price),
    cost: numberValue(row.cost),
    stock: Number(row.stock_quantity ?? row.stock ?? 0),
    category: productCategory(String(row.category ?? "")),
    icon: String(row.icon ?? productIcon(name)),
  };
}

function mapBooking(row: Record<string, unknown>): Booking {
  const start = String(row.start_time ?? "");
  const end = String(row.end_time ?? "");
  const statusMap: Record<string, Booking["status"]> = {
    pending: "Pending",
    confirmed: "Confirmed",
    arrived: "Arrived",
    cancelled: "Cancelled",
    no_show: "No-show",
    completed: "Completed",
  };
  return {
    id: String(row.id),
    customerName: String(row.customer_name ?? ""),
    phone: String(row.phone ?? ""),
    simulatorType: String(row.booking_type ?? "session"),
    simulatorId: String(row.simulator_id ?? ""),
    date: shortDate(start),
    startTime: shortTime(start),
    endTime: shortTime(end),
    tariff: String(row.booking_type ?? "Booking"),
    prepayment: 0,
    note: String(row.note ?? ""),
    status: statusMap[String(row.status ?? "pending")] ?? "Pending",
  };
}

function mapRepair(row: Record<string, unknown>): RepairRequest {
  const statusMap: Record<string, RepairRequest["status"]> = {
    requested: "pending",
    approved: "approved",
    rejected: "rejected",
    need_more_details: "more_details_requested",
    fixing: "fixing",
    fixed_waiting_confirmation: "fixed_waiting_confirmation",
    confirmed_fixed: "confirmed_fixed",
    rejected_fix: "fixing",
  };
  return {
    id: String(row.id),
    simulatorId: String(row.simulator_id ?? ""),
    simulatorName: String(row.simulator_name ?? row.simulator_id ?? ""),
    branchId: String(row.branch_id ?? ""),
    branchName: String(row.branch_name ?? ""),
    requestedBy: String(row.requested_by ?? ""),
    requestedAt: backendDateTime(String(row.requested_at ?? "")),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    errorType: String(row.error_type ?? "other") as RepairErrorType,
    priority: String(row.priority ?? "medium") as RepairPriority,
    note: String(row.admin_note ?? row.super_admin_note ?? ""),
    status: statusMap[String(row.status ?? "requested")] ?? "pending",
    affectedRevenue: numberValue(row.revenue_impact),
    approvedAt: row.approved_at ? String(row.approved_at) : undefined,
    fixingStartedAt: row.fixing_started_at ? String(row.fixing_started_at) : undefined,
    fixedAt: row.marked_fixed_at ? String(row.marked_fixed_at) : undefined,
    confirmedAt: row.confirmed_at ? String(row.confirmed_at) : undefined,
  };
}

function mapShift(row: Record<string, unknown>, operator: string): Shift {
  const openedAt = String(row.opened_at ?? "");
  const closedAt = row.closed_at ? String(row.closed_at) : undefined;
  return {
    id: String(row.id),
    operator,
    date: shortDate(openedAt),
    shiftType: "Kunduzgi (09:00 - 18:00)",
    status: String(row.status ?? "open") === "closed" ? "closed" : "open",
    openTime: shortTime(openedAt),
    closeTime: closedAt ? shortTime(closedAt) : undefined,
    startingCash: numberValue(row.starting_cash),
    expectedCash: numberValue(row.expected_cash),
    actualCash: row.actual_cash == null ? undefined : numberValue(row.actual_cash),
    discrepancy: row.difference == null ? undefined : numberValue(row.difference),
    cardRevenue: numberValue(row.card_total),
    qrRevenue: numberValue(row.qr_total),
    totalIncome: numberValue(row.product_sales) + numberValue(row.session_sales),
    totalExpense: numberValue(row.refunds),
    notes: row.notes ? String(row.notes) : undefined,
  };
}

function mapSale(row: Record<string, unknown>, operator: string): BarSale {
  const created = String(row.created_at ?? "");
  return {
    id: String(row.id),
    date: shortDate(created),
    time: shortTime(created),
    operator,
    items: [],
    totalAmount: numberValue(row.total),
    paymentMethod: String(row.payment_method ?? ""),
    branchId: String(row.branch_id ?? ""),
  };
}

function mapPayment(row: Record<string, unknown>, operator: string): CashTransaction {
  const created = String(row.paid_at ?? row.created_at ?? "");
  return {
    id: String(row.id),
    type: "income",
    amount: numberValue(row.amount),
    source: row.sale_id ? "Shop sale" : row.session_id ? "Session payment" : "Payment",
    operator,
    date: shortDate(created),
    time: shortTime(created),
    paymentMethod: String(row.method ?? ""),
    branchId: String(row.branch_id ?? ""),
    shiftId: undefined,
  };
}

function mapLog(row: Record<string, unknown>): LogEntry {
  return {
    id: String(row.id),
    time: shortTime(String(row.created_at ?? "")),
    operator: String(row.actor_name ?? "System"),
    action: String(row.action_type ?? ""),
    simulator: row.simulator_id ? String(row.simulator_id) : undefined,
    paymentMethod: row.details && typeof row.details === "object" && "method" in row.details ? String((row.details as { method?: unknown }).method ?? "") : undefined,
  };
}

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const [branchList, setBranchList] = useState<Branch[]>([fallbackBranch]);
  const [allSimulators, setAllSimulators] = useState<Simulator[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lockUnlockLogs, setLockUnlockLogs] = useState<LockUnlockEntry[]>([]);
  const [barSales, setBarSales] = useState<BarSale[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [customStartDate, setCustomStartDate] = useState(() => localDate());
  const [customEndDate, setCustomEndDate] = useState(() => localDate());
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const expireSessionRef = useRef<(id: string) => void>(() => undefined);
  const defaultBranchId = data?.user?.role === "super_admin" ? "all" : data?.user?.branchIds?.[0] ?? fallbackBranch.id;
  const [selectedBranchId, setSelectedBranchIdState] = useState(defaultBranchId);
  const [period, setPeriod] = useState<PeriodFilter>("today");


  const operator = data?.user?.name ?? "Admin";
  const role = data?.user?.role;
  const allowedBranchIds = data?.user?.branchIds ?? [];
  const canUseAllBranches = role === "super_admin";
  const realBranches = branchList.filter((branch) => branch.id !== fallbackBranch.id);
  const firstBackendBranchId = realBranches[0]?.id ?? allowedBranchIds[0] ?? fallbackBranch.id;
  const selectedBranchExists = selectedBranchId === "all" || branchList.some((branch) => branch.id === selectedBranchId);
  const effectiveBranchId = canUseAllBranches ? (selectedBranchExists ? selectedBranchId : "all") : (branchList.find((branch) => allowedBranchIds.includes(branch.id))?.id ?? allowedBranchIds[0] ?? fallbackBranch.id);
  const apiBranchId = effectiveBranchId === fallbackBranch.id ? (canUseAllBranches ? "all" : allowedBranchIds[0] ?? "") : effectiveBranchId;
  const visibleBranchIds = effectiveBranchId === "all" ? realBranches.map((branch) => branch.id) : [effectiveBranchId];
  const simulators = allSimulators.filter((item) => visibleBranchIds.includes(item.branchId));
  const scopedRepairRequests = repairRequests.filter((item) => visibleBranchIds.includes(item.branchId));

  useEffect(() => {
    if (!data?.user) return;
    const nextBranchId = data.user.role === "super_admin" ? "all" : branchList.find((branch) => data.user.branchIds.includes(branch.id))?.id ?? data.user.branchIds[0] ?? fallbackBranch.id;
    setSelectedBranchIdState((current) => (data.user.role === "super_admin" && current !== fallbackBranch.id ? current : nextBranchId));
  }, [branchList, data?.user]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const expiringIds: string[] = [];
      setAllSimulators((items) => items.map((item) => {
        if (!["busy", "unpaid"].includes(item.status)) return item;
        // Open (VIP) sessions count up and never auto-expire; the accrued amount grows live.
        if (item.billingMode === "open") {
          const elapsedSeconds = (item.elapsedSeconds ?? item.remainingSeconds ?? 0) + 1;
          const accruedAmount = item.hourlyRate
            ? Math.round((Math.ceil(elapsedSeconds / 60) * item.hourlyRate) / 60)
            : item.accruedAmount;
          return { ...item, elapsedSeconds, remainingSeconds: elapsedSeconds, remainingMinutes: Math.ceil(elapsedSeconds / 60), accruedAmount };
        }
        if (!item.remainingSeconds) return item;
        if (item.remainingSeconds <= 1) {
          expiringIds.push(item.id);
          return { ...item, remainingSeconds: 0, remainingMinutes: 0 };
        }
        const remainingSeconds = item.remainingSeconds - 1;
        return { ...item, remainingSeconds, remainingMinutes: Math.ceil(remainingSeconds / 60) };
      }));
      if (expiringIds.length) {
        queueMicrotask(() => expiringIds.forEach((id) => expireSessionRef.current(id)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function refreshBackendData() {
    if (!data?.user || !apiBranchId) return;
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    const task = (async () => {
      try {
      const branchRows = await backendGet<Array<Record<string, unknown>>>("/branches");
      const nextBranches = branchRows.map((row) => ({ id: String(row.id), name: String(row.name) }));
      const branchSource = nextBranches.length ? nextBranches : [fallbackBranch];
      const dataBranchId = apiBranchId === "all" ? "all" : apiBranchId;
      const productBranchId = dataBranchId === "all" ? branchSource[0]?.id ?? "all" : dataBranchId;
      const query = `branch_id=${encodeURIComponent(dataBranchId)}`;
      const productQuery = `branch_id=${encodeURIComponent(productBranchId)}`;
      const [rigs, productRows, bookingRows, repairRows, logRows, shiftRows, saleRows, paymentRows] = await Promise.all([
        fetchRigList(dataBranchId),
        backendGet<Array<Record<string, unknown>>>(`/cashier/products?${productQuery}`),
        backendGet<Array<Record<string, unknown>>>(`/bookings?${query}`),
        backendGet<Array<Record<string, unknown>>>(`/repair-requests?${query}`),
        backendGet<Array<Record<string, unknown>>>(`/logs?${query}`),
        backendGet<Array<Record<string, unknown>>>(`/shifts?${query}`),
        backendGet<Array<Record<string, unknown>>>(`/cashier/sales?${query}`),
        backendGet<Array<Record<string, unknown>>>(`/payments?${query}`),
      ]);
      const nextRepairs = repairRows.map(mapRepair);
      const nextSimulators = rigsToSimulators(rigs, branchSource).map((simulator) => {
        const activeRepair = nextRepairs.find((repair) => repair.simulatorId === simulator.id && !["rejected", "confirmed_fixed"].includes(repair.status));
        return activeRepair ? { ...simulator, repairRequestId: activeRepair.id } : simulator;
      });

      setBranchList(branchSource);
      setAllSimulators(nextSimulators);
      setInventory(productRows.map(mapProduct));
      setBookings(bookingRows.map(mapBooking));
      setRepairRequests(nextRepairs);
      setLogs(logRows.map(mapLog));
      setShifts(shiftRows.map((row) => mapShift(row, operator)));
      setBarSales(saleRows.map((row) => mapSale(row, operator)));
      setCashTransactions(paymentRows.map((row) => mapPayment(row, operator)));
      setRevenue(paymentRows.reduce((sum, row) => sum + numberValue(row.amount), 0));
      setRevenueEvents(paymentRows.map((row) => {
        const created = String(row.paid_at ?? row.created_at ?? "");
        return {
          id: String(row.id),
          time: shortTime(created),
          date: shortDate(created),
          amount: numberValue(row.amount),
          source: row.sale_id ? "shop sale" : row.session_id ? "session payment" : "payment",
          branchId: String(row.branch_id ?? ""),
        };
      }));
      setSelectedId((current) => (current && nextSimulators.some((item) => item.id === current) ? current : nextSimulators[0]?.id ?? null));
      } catch {
      // Keep the last simulator snapshot visible if a secondary dashboard endpoint fails.
      } finally {
      setLoading(false);
      }
    })();

    refreshInFlightRef.current = task;
    task.finally(() => {
      if (refreshInFlightRef.current === task) refreshInFlightRef.current = null;
    });
    return task;
  }

  async function refreshSimulatorsOnly(branches = branchList) {
    if (!data?.user || !apiBranchId) return;
    try {
      const branchRows = branches.some((branch) => branch.id !== fallbackBranch.id)
        ? []
        : await backendGet<Array<Record<string, unknown>>>("/branches");
      const branchSource = branchRows.length ? branchRows.map((row) => ({ id: String(row.id), name: String(row.name) })) : branches;
      const nextSimulators = rigsToSimulators(await fetchRigList(apiBranchId), branchSource);
      if (branchRows.length) setBranchList(branchSource);
      setAllSimulators(nextSimulators);
      setSelectedId((current) => (current && nextSimulators.some((item) => item.id === current) ? current : nextSimulators[0]?.id ?? null));
    } catch {
      // The websocket snapshot remains the source of truth until the next successful fetch.
    }
  }

  async function writableBranchId() {
    if (effectiveBranchId !== "all" && effectiveBranchId !== fallbackBranch.id) return effectiveBranchId;
    const current = branchList.find((branch) => branch.id !== fallbackBranch.id);
    if (current) return current.id;
    const branchRows = await backendGet<Array<Record<string, unknown>>>("/branches");
    const nextBranches = branchRows.map((row) => ({ id: String(row.id), name: String(row.name) }));
    if (nextBranches.length) {
      setBranchList(nextBranches);
      return nextBranches[0].id;
    }
    throw new Error("Backend branch topilmadi");
  }

  useEffect(() => {
    if (!data?.user || !apiBranchId) return;
    void refreshBackendData();
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let refreshTimer: number | null = null;

    const refreshEvents = new Set([
      "simulator_updated",
      "simulator_online",
      "simulator_offline",
      "session_started",
      "session_stopped",
      "payment_created",
      "sale_created",
      "inventory_updated",
      "repair_requested",
      "repair_approved",
      "repair_status_changed",
      "booking_created",
      "shift_opened",
      "shift_closed",
      "log_created",
    ]);

    function scheduleBackendRefresh(delay = 200) {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void refreshBackendData();
      }, delay);
    }

    async function connectDashboardSocket() {
      try {
        const token = await getBackendWsToken();
        if (!token || cancelled) return;

        const wsBase = process.env.NEXT_PUBLIC_BACKEND_WS_URL ?? "ws://localhost:4000/ws/dashboard";
        const url = new URL(wsBase);
        url.searchParams.set("token", token);
        url.searchParams.set("branch_id", apiBranchId);

        socket = new WebSocket(url);
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "simulators_snapshot" && Array.isArray(message.data?.simulators)) {
              const snapshotBranches = message.data.simulators.reduce((items: Branch[], row: Record<string, unknown>) => {
                const id = String(row.branch_id ?? "");
                if (!id || items.some((branch) => branch.id === id)) return items;
                items.push({ id, name: String(row.branch_name ?? id) });
                return items;
              }, branchList.filter((branch) => branch.id !== fallbackBranch.id));
              const branchSource = snapshotBranches.length ? snapshotBranches : branchList;
              const nextSimulators = rigsToSimulators(mapBackendSimulatorRows(message.data.simulators), branchSource);
              if (snapshotBranches.length) setBranchList(snapshotBranches);
              setAllSimulators(nextSimulators);
              setSelectedId((current) => (current && nextSimulators.some((item) => item.id === current) ? current : nextSimulators[0]?.id ?? null));
              window.setTimeout(() => void refreshSimulatorsOnly(branchSource), 250);
              return;
            }
            if (refreshEvents.has(message.type)) scheduleBackendRefresh();
          } catch {
            // Ignore non-JSON websocket noise.
          }
        };
        socket.onclose = () => {
          if (cancelled) return;
          reconnectTimer = window.setTimeout(connectDashboardSocket, 1500);
        };
      } catch {
        if (!cancelled) reconnectTimer = window.setTimeout(connectDashboardSocket, 3000);
      }
    }

    void connectDashboardSocket();
    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (refreshTimer) window.clearTimeout(refreshTimer);
      socket?.close();
    };
  }, [apiBranchId]);

  function appendLog(action: string, simulator?: string, paymentMethod?: string) {
    setLogs((items) => [{ id: crypto.randomUUID(), time: now(), operator, action, simulator, paymentMethod }, ...items]);
  }

  function recordRevenue(amount: number, source: string, branchId?: string) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setRevenue((current) => current + amount);
    setRevenueEvents((items) => [{ id: crypto.randomUUID(), time: now(), amount, source, branchId }, ...items]);
  }

  function patchSimulator(id: string, patch: Partial<Simulator>) {
    setAllSimulators((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function patchRepair(requestId: string, patch: Partial<RepairRequest>) {
    setRepairRequests((items) => items.map((item) => (item.id === requestId ? { ...item, ...patch } : item)));
  }

  function refreshAfterAction() {
    void refreshBackendData();
    window.setTimeout(() => void refreshSimulatorsOnly(), 300);
  }

  function setSelectedBranchId(id: string) {
    if (!canUseAllBranches) return;
    setSelectedBranchIdState(id);
    const first = id === "all" ? allSimulators[0] : allSimulators.find((item) => item.branchId === id);
    setSelectedId(first?.id ?? null);
  }

  const activeShift = useMemo(() => shifts.find((item) => item.status === "open") ?? null, [shifts]);

  const value = useMemo<DashboardStore>(() => ({
    loading,
    simulators,
    allSimulators,
    selectedId,
    selected: allSimulators.find((item) => item.id === selectedId && visibleBranchIds.includes(item.branchId)),
    setSelectedId,
    revenue,
    revenueEvents: revenueEvents.filter((event) => !event.branchId || visibleBranchIds.includes(event.branchId)),
    logs,
    lockUnlockLogs,
    barSales,
    cashTransactions,
    shifts,
    activeShift,
    repairRequests: scopedRepairRequests,
    products: inventory,
    order,
    bookings,
    branches: branchList,
    selectedBranchId: effectiveBranchId,
    setSelectedBranchId,
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    startSession(id, payload) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || !visibleBranchIds.includes(simulator.branchId) || ["offline", "locked", "broken", "repair_requested", "repair_approved", "fixing", "fixed_waiting_confirmation"].includes(simulator.status)) return;
      const isPaid = payload.paymentStatus === "paid";
      const method = toApiPaymentMethod(isPaid ? payload.paymentMethod : undefined);
      void backendPost<Record<string, unknown>>("/sessions/start", {
        simulator_id: simulator.id,
        branch_id: simulator.branchId,
        customer_name: payload.customerName,
        customer_id: payload.customerId,
        phone: payload.phone,
        tariff_id: payload.tariffId,
        payment_mode: isPaid ? "prepaid" : "postpaid",
        duration_minutes: payload.duration,
        paid_amount: isPaid ? payload.amount : 0,
        method,
      }).then(refreshAfterAction).catch(() => undefined);
      patchSimulator(id, {
        status: "busy",
        currentUser: payload.customerName || "Guest",
        phone: payload.phone,
        tariff: payload.tariff,
        startedAt: now(),
        remainingMinutes: payload.duration,
        remainingSeconds: payload.duration * 60,
        paidAmount: isPaid ? payload.amount : 0,
        paymentStatus: payload.paymentStatus,
      });
      if (isPaid) recordRevenue(payload.amount, `session started ${simulator.name}`, simulator.branchId);
      appendLog(`started session on ${simulator.name}`, simulator.name);
    },
    addTime(id, minutes, amount, method) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      const currentSeconds = simulator.remainingSeconds ?? simulator.remainingMinutes * 60;
      const newRemainingSeconds = currentSeconds + minutes * 60;
      const apiMethod = toApiPaymentMethod(method);

      const applyLocal = () => {
        patchSimulator(id, {
          remainingMinutes: Math.ceil(newRemainingSeconds / 60),
          remainingSeconds: newRemainingSeconds,
          paidAmount: simulator.paidAmount + amount,
          paymentStatus: "paid",
          status: "busy",
        });
        recordRevenue(amount, `added time ${simulator.name}`, simulator.branchId);
        appendLog(`added ${minutes} min to ${simulator.name}`, simulator.name, method);
      };

      if (simulator.currentSessionId) {
        void backendPost<Record<string, unknown>>(`/sessions/${simulator.currentSessionId}/add-time`, {
          minutes,
          amount,
          method: apiMethod,
        })
          .then(() => {
            applyLocal();
            return refreshAfterAction();
          })
          .catch(() => undefined);
        return;
      }

      if (simulator.rigId) {
        const totalMinutes = Math.max(1, Math.ceil(newRemainingSeconds / 60));
        void unlockAdminRig(simulator.rigId, totalMinutes)
          .then(() => {
            applyLocal();
            return refreshAfterAction();
          })
          .catch(() => undefined);
        return;
      }

      applyLocal();
    },
    pay(id, amount, method) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      const apiMethod = toApiPaymentMethod(method);
      void backendPost<Record<string, unknown>>("/payments", {
        branch_id: simulator.branchId,
        session_id: simulator.currentSessionId ?? undefined,
        method: apiMethod,
        ...splitPayment(amount, apiMethod),
      }).then(refreshAfterAction).catch(() => undefined);
      patchSimulator(id, { paidAmount: simulator.paidAmount + amount, paymentStatus: "paid", status: simulator.status === "unpaid" ? "busy" : simulator.status });
      recordRevenue(amount, `session payment ${simulator.name}`, simulator.branchId);
      appendLog(`received ${amount.toLocaleString("uz-UZ")} by ${method}`, simulator.name, method);
    },
    stopSession(id, override) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || (simulator.paymentStatus !== "paid" && !override)) return;
      if (simulator.rigId) void lockAdminRig(simulator.rigId).then(refreshAfterAction).catch(() => undefined);
      if (simulator.currentSessionId) void backendPost<Record<string, unknown>>(`/sessions/${simulator.currentSessionId}/stop`).then(refreshAfterAction).catch(() => undefined);
      patchSimulator(id, { status: "ready_to_play", currentUser: undefined, phone: undefined, tariff: undefined, startedAt: undefined, remainingMinutes: 0, remainingSeconds: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] });
      appendLog(`stopped session on ${simulator.name}`, simulator.name);
    },
    toggleLock(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      const isLocked = simulator.rigId ? Boolean(simulator.rigOnline && simulator.status === "ready_to_play") : simulator.status === "locked";
      const nextStatus = simulator.rigId ? (isLocked ? "busy" : "ready_to_play") : (isLocked ? "ready_to_play" : "locked");
      if (simulator.rigId) {
        void (isLocked ? unlockAdminRig(simulator.rigId) : lockAdminRig(simulator.rigId)).then(refreshBackendData).catch(() => undefined);
      } else {
        void backendPatch<Record<string, unknown>>(`/simulators/${simulator.id}/status`, { status: nextStatus }).then(refreshBackendData).catch(() => undefined);
      }
      patchSimulator(id, { status: nextStatus });
      appendLog(`${isLocked ? "unlocked" : "locked"} ${simulator.name}`, simulator.name);

      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = localDate(d);
      setLockUnlockLogs((items) => [
        {
          id: crypto.randomUUID(),
          time: timeStr,
          date: dateStr,
          operator,
          simulator: simulator.name,
          action: isLocked ? "unlock" : "lock",
        },
        ...items,
      ]);
    },
    requestFix(id, payload) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || !visibleBranchIds.includes(simulator.branchId)) return;
      const request: RepairRequest = {
        id: crypto.randomUUID(),
        simulatorId: simulator.id,
        simulatorName: simulator.name,
        branchId: simulator.branchId,
        branchName: simulator.branchName,
        requestedBy: operator,
        requestedAt: new Date().toLocaleString("uz-UZ"),
        title: payload.title,
        description: payload.description,
        errorType: payload.errorType,
        priority: payload.priority,
        note: payload.note,
        status: "pending",
        affectedRevenue: simulator.status === "busy" ? simulator.paidAmount : 0,
      };
      void backendPost<Record<string, unknown>>("/repair-requests", {
        simulator_id: simulator.id,
        title: payload.title,
        description: payload.description,
        error_type: payload.errorType,
        priority: payload.priority,
        admin_note: payload.note,
      }).then(refreshBackendData).catch(() => undefined);
      setRepairRequests((items) => [request, ...items]);
      patchSimulator(id, { status: "repair_requested", repairRequestId: request.id });
      appendLog(`requested fix for ${simulator.name}`, simulator.name);
    },
    approveRepair(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      void backendPost<Record<string, unknown>>(`/repair-requests/${requestId}/approve`).then(refreshBackendData).catch(() => undefined);
      patchRepair(requestId, { status: "approved", approvedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "repair_approved" });
      appendLog(`approved repair for ${request.simulatorName}`, request.simulatorName);
    },
    rejectRepair(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      void backendPost<Record<string, unknown>>(`/repair-requests/${requestId}/reject`).then(refreshBackendData).catch(() => undefined);
      patchRepair(requestId, { status: "rejected", rejectedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "broken" });
      appendLog(`rejected repair for ${request.simulatorName}`, request.simulatorName);
    },
    askRepairDetails(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      void backendPost<Record<string, unknown>>(`/repair-requests/${requestId}/need-more-details`).then(refreshBackendData).catch(() => undefined);
      patchRepair(requestId, { status: "more_details_requested" });
      appendLog(`asked for more details on ${request.simulatorName}`, request.simulatorName);
    },
    startFixing(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || simulator.status !== "repair_approved") return;
      if (simulator.repairRequestId) void backendPost<Record<string, unknown>>(`/repair-requests/${simulator.repairRequestId}/start-fixing`).then(refreshBackendData).catch(() => undefined);
      patchSimulator(id, { status: "fixing" });
      if (simulator.repairRequestId) patchRepair(simulator.repairRequestId, { status: "fixing", fixingStartedAt: new Date().toLocaleString("uz-UZ") });
      appendLog(`started fixing ${simulator.name}`, simulator.name);
    },
    markFixed(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || simulator.status !== "fixing") return;
      if (simulator.repairRequestId) void backendPost<Record<string, unknown>>(`/repair-requests/${simulator.repairRequestId}/mark-fixed`).then(refreshBackendData).catch(() => undefined);
      patchSimulator(id, { status: "fixed_waiting_confirmation" });
      if (simulator.repairRequestId) patchRepair(simulator.repairRequestId, { status: "fixed_waiting_confirmation", fixedAt: new Date().toLocaleString("uz-UZ") });
      appendLog(`marked ${simulator.name} fixed and waiting confirmation`, simulator.name);
    },
    confirmFixed(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      void backendPost<Record<string, unknown>>(`/repair-requests/${requestId}/confirm-fixed`).then(refreshBackendData).catch(() => undefined);
      patchRepair(requestId, { status: "confirmed_fixed", confirmedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "ready_to_play", repairRequestId: undefined });
      appendLog(`confirmed fixed ${request.simulatorName}`, request.simulatorName);
    },
    rejectFix(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      void backendPost<Record<string, unknown>>(`/repair-requests/${requestId}/reject-fix`).then(refreshBackendData).catch(() => undefined);
      patchRepair(requestId, { status: "fixing" });
      patchSimulator(request.simulatorId, { status: "fixing" });
      appendLog(`rejected fix confirmation for ${request.simulatorName}`, request.simulatorName);
    },
    addBooking(booking) {
      const simulator = allSimulators.find((item) => item.id === booking.simulatorId);
      void backendPost<Record<string, unknown>>("/bookings", {
        branch_id: simulator?.branchId ?? firstBackendBranchId,
        simulator_id: booking.simulatorId,
        booking_type: booking.simulatorType || "session",
        customer_name: booking.customerName,
        phone: booking.phone,
        start_time: dateTimeFromParts(booking.date, booking.startTime),
        end_time: dateTimeFromParts(booking.date, booking.endTime),
        status: booking.status.toLowerCase().replace("-", "_"),
        note: booking.note,
      }).then(refreshBackendData).catch(() => undefined);
      setBookings((items) => [booking, ...items]);
      patchSimulator(booking.simulatorId, { status: "reserved", currentUser: booking.customerName, paidAmount: booking.prepayment, paymentStatus: booking.prepayment ? "partial" : "unpaid" });
      appendLog(`created booking for ${booking.simulatorId}`, booking.simulatorId);
    },
    updateBooking(booking) {
      void backendPatch<Record<string, unknown>>(`/bookings/${booking.id}`, {
        simulator_id: booking.simulatorId,
        booking_type: booking.simulatorType || "session",
        customer_name: booking.customerName,
        phone: booking.phone,
        start_time: dateTimeFromParts(booking.date, booking.startTime),
        end_time: dateTimeFromParts(booking.date, booking.endTime),
        status: booking.status.toLowerCase().replace("-", "_"),
        note: booking.note,
      }).then(refreshBackendData).catch(() => undefined);
      setBookings((items) => items.map((item) => (item.id === booking.id ? booking : item)));
      patchSimulator(booking.simulatorId, { status: booking.status === "Cancelled" ? "ready_to_play" : "reserved", currentUser: booking.status === "Cancelled" ? undefined : booking.customerName, paidAmount: booking.status === "Cancelled" ? 0 : booking.prepayment, paymentStatus: booking.prepayment ? "partial" : "unpaid" });
      appendLog(`updated booking for ${booking.simulatorId}`, booking.simulatorId);
    },
    deleteBooking(id) {
      const booking = bookings.find((item) => item.id === id);
      void backendPost<Record<string, unknown>>(`/bookings/${id}/cancel`).then(refreshBackendData).catch(() => undefined);
      setBookings((items) => items.filter((item) => item.id !== id));
      if (booking) {
        patchSimulator(booking.simulatorId, { status: "ready_to_play", currentUser: undefined, paidAmount: 0, paymentStatus: "paid" });
        appendLog(`deleted booking for ${booking.simulatorId}`, booking.simulatorId);
      }
    },
    addProduct(product) {
      if (product.stock <= 0) return;
      setOrder((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) return items.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        return [...items, { ...product, qty: 1 }];
      });
    },
    addProductByQr(code) {
      const normalized = code.trim().toLowerCase();
      if (!normalized) return null;
      const product = inventory.find((item) => item.qrCode.toLowerCase() === normalized || item.id.toLowerCase() === normalized);
      if (!product || product.stock <= 0) return null;
      setOrder((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) return items.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        return [...items, { ...product, qty: 1 }];
      });
      void backendPost<Record<string, unknown>>("/cashier/scan", {
        branch_id: effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId,
        barcode: product.qrCode,
      }).catch(() => undefined);
      appendLog(`scanned product ${product.name}`);
      return product;
    },
    async createProduct(product) {
      const branchId = await writableBranchId();
      const row = await backendPost<Record<string, unknown>>("/products", {
        branch_id: branchId,
        name: product.name,
        category: product.category,
        barcode: product.qrCode,
        price: product.price,
        cost: product.cost ?? 0,
        icon: product.icon || "snack",
        is_active: true,
        stock_quantity: product.stock,
      });
      const created = mapProduct(row);
      setInventory((items) => [created, ...items.filter((item) => item.id !== created.id)]);
      appendLog(`created product ${created.name} with QR ${created.qrCode}`);
      void refreshBackendData().catch(() => undefined);
      return created;
    },
    updateProduct(id, product) {
      const existing = inventory.find((item) => item.id === id);
      if (!existing) return null;
      const updated = { ...product, id };
      void backendPatch<Record<string, unknown>>(`/products/${id}`, {
        name: product.name,
        category: product.category,
        barcode: product.qrCode,
        price: product.price,
        cost: product.cost ?? 0,
        icon: product.icon || "snack",
        is_active: true,
      })
        .then(() => backendPost<Record<string, unknown>>("/inventory/adjust", {
          branch_id: effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId,
          product_id: id,
          quantity: product.stock,
          reason: "dashboard product update",
        }))
        .then(refreshBackendData)
        .catch(() => undefined);
      setInventory((items) => items.map((item) => (item.id === id ? updated : item)));
      setOrder((items) => items.map((item) => (item.id === id ? { ...updated, qty: item.qty } : item)));
      appendLog(`updated product ${updated.name} with QR ${updated.qrCode}`);
      return updated;
    },
    deleteProduct(id) {
      const existing = inventory.find((item) => item.id === id);
      void backendDelete<Record<string, unknown>>(`/products/${id}`).then(refreshBackendData).catch(() => undefined);
      setInventory((items) => items.filter((item) => item.id !== id));
      setOrder((items) => items.filter((item) => item.id !== id));
      if (existing) appendLog(`deleted product ${existing.name}`);
    },
    recordCashierTransaction(action, amount, method) {
      if (!Number.isFinite(amount) || amount <= 0) return;
      const apiMethod = toApiPaymentMethod(method);
      void backendPost<Record<string, unknown>>("/payments", {
        branch_id: effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId,
        method: apiMethod,
        ...splitPayment(amount, apiMethod),
      }).then(refreshBackendData).catch(() => undefined);
      recordRevenue(amount, action);
      appendLog(`${action} ${amount.toLocaleString("uz-UZ")}`, undefined, method);
    },
    updateQty(id, qty) {
      setOrder((items) => (qty <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, qty } : item))));
    },
    clearOrder() {
      setOrder([]);
    },
    payOrder(attachTo, paymentMethod = "Karta", customerId, payment) {
      const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (!total) return;
      const simulator = attachTo ? allSimulators.find((item) => item.id === attachTo) : undefined;
      const apiMethod = toApiPaymentMethod(paymentMethod);
      void backendPost<Record<string, unknown>>("/cashier/sales", {
        branch_id: simulator?.branchId ?? (effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId),
        session_id: simulator?.currentSessionId ?? undefined,
        customer_id: customerId ?? undefined,
        items: order.map((item) => ({ product_id: item.id, quantity: item.qty })),
      })
        .then((sale) => backendPost<Record<string, unknown>>(`/cashier/sales/${String(sale.id)}/pay`, {
          method: apiMethod,
          ...splitPayment(total, apiMethod),
          ...payment,
        }))
        .then(refreshBackendData)
        .catch(() => undefined);
      recordRevenue(total, "shop order", simulator?.branchId);
      if (attachTo) {
        const names = order.map((item) => item.name).join(", ");
        patchSimulator(attachTo, { orderItems: [...(simulator?.orderItems ?? []), names] });
      }
      appendLog(`paid shop order ${total.toLocaleString("uz-UZ")}${customerId ? " for registered customer" : ""}`, attachTo);

      // Record a detailed BarSale
      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = localDate(d);

      const newSale: BarSale = {
        id: crypto.randomUUID(),
        date: dateStr,
        time: timeStr,
        operator,
        items: order.map((o) => ({
          productId: o.id,
          name: o.name,
          qty: o.qty,
          price: o.price,
        })),
        totalAmount: total,
        paymentMethod,
        branchId: simulator?.branchId ?? firstBackendBranchId,
        shiftId: activeShift?.id ?? undefined,
      };
      setBarSales((items) => [newSale, ...items]);

      // If active shift exists, update its revenues
      if (activeShift) {
        setShifts((prev) =>
          prev.map((s) => {
            if (s.id === activeShift.id) {
              return {
                ...s,
                cardRevenue: paymentMethod === "Karta" ? s.cardRevenue + total : s.cardRevenue,
                qrRevenue: paymentMethod === "QR" ? s.qrRevenue + total : s.qrRevenue,
              };
            }
            return s;
          })
        );
      }

      setOrder([]);
    },
    openShift(operatorName, shiftType, startingCash) {
      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = localDate(d);
      void backendPost<Record<string, unknown>>("/shifts/open", {
        branch_id: effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId,
        starting_cash: startingCash,
      }).then(refreshBackendData).catch(() => undefined);
      const newShift: Shift = {
        id: crypto.randomUUID(),
        operator: operatorName,
        date: dateStr,
        shiftType,
        status: "open",
        openTime: timeStr,
        startingCash,
        cardRevenue: 0,
        qrRevenue: 0,
        totalIncome: 0,
        totalExpense: 0,
      };
      setShifts((prev) => [newShift, ...prev]);
      appendLog(`opened shift: ${shiftType} with cash ${startingCash.toLocaleString()}`);
    },
    closeShift(actualCash, notes) {
      if (!activeShift) return;
      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      void backendPost<Record<string, unknown>>(`/shifts/${activeShift.id}/close`, {
        actual_cash: actualCash,
        notes,
      }).then(refreshBackendData).catch(() => undefined);

      const shiftBarCash = barSales
        .filter((s) => s.shiftId === activeShift.id && s.paymentMethod === "Naqd")
        .reduce((sum, s) => sum + s.totalAmount, 0);

      const expectedCash = activeShift.startingCash + activeShift.totalIncome - activeShift.totalExpense + shiftBarCash;
      const discrepancy = actualCash - expectedCash;

      setShifts((prev) =>
        prev.map((s) => {
          if (s.id === activeShift.id) {
            return {
              ...s,
              status: "closed",
              closeTime: timeStr,
              expectedCash,
              actualCash,
              discrepancy,
              notes,
            };
          }
          return s;
        })
      );
      appendLog(`closed shift: ${activeShift.shiftType}. Actual cash: ${actualCash.toLocaleString()}`);
    },
    addCashTransaction(type, amount, source, method) {
      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = localDate(d);
      const newTx: CashTransaction = {
        id: crypto.randomUUID(),
        type,
        amount,
        source,
        operator,
        date: dateStr,
        time: timeStr,
        paymentMethod: method,
        branchId: effectiveBranchId === "all" ? firstBackendBranchId : effectiveBranchId,
        shiftId: activeShift?.id ?? undefined,
      };
      if (type === "income") {
        const apiMethod = toApiPaymentMethod(method);
        void backendPost<Record<string, unknown>>("/payments", {
          branch_id: newTx.branchId,
          method: apiMethod,
          ...splitPayment(amount, apiMethod),
        }).then(refreshBackendData).catch(() => undefined);
      }
      setCashTransactions((prev) => [newTx, ...prev]);

      if (activeShift) {
        setShifts((prev) =>
          prev.map((s) => {
            if (s.id === activeShift.id) {
              return {
                ...s,
                totalIncome: type === "income" ? s.totalIncome + amount : s.totalIncome,
                totalExpense: type === "expense" ? s.totalExpense + amount : s.totalExpense,
                cardRevenue: type === "income" && method === "Karta" ? s.cardRevenue + amount : s.cardRevenue,
                qrRevenue: type === "income" && method === "QR" ? s.qrRevenue + amount : s.qrRevenue,
              };
            }
            return s;
          })
        );
      }

      if (type === "income") {
        recordRevenue(amount, `Cash In: ${source}`, newTx.branchId);
      } else {
        setRevenue((current) => current - amount);
        setRevenueEvents((items) => [
          { id: crypto.randomUUID(), time: timeStr, amount: -amount, source: `Expense: ${source}`, branchId: newTx.branchId },
          ...items,
        ]);
        appendLog(`expense recorded: ${source} - ${amount.toLocaleString()}`, undefined, method);
      }
    },
    refreshRigs() {
      void refreshBackendData();
    },
    notifyRig(id, message) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator?.rigId) return;
      void notifyAdminRig(simulator.rigId, message).catch(() => undefined);
    },
    pushRigUpdate(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator?.rigId) return;
      void pushAdminRigUpdate([simulator.rigId]).then(refreshBackendData).catch(() => undefined);
    },
    removeOfflineRig(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator?.rigId || simulator.rigOnline) return;
      void removeAdminRig(simulator.rigId)
        .then(() => {
          setAllSimulators((items) => items.filter((item) => item.id !== id));
          return refreshBackendData();
        })
        .catch(() => undefined);
    },
  }), [
    loading,
    allSimulators,
    bookings,
    effectiveBranchId,
    inventory,
    logs,
    lockUnlockLogs,
    barSales,
    cashTransactions,
    shifts,
    activeShift,
    customStartDate,
    customEndDate,
    order,
    operator,
    period,
    repairRequests,
    revenue,
    revenueEvents,
    role,
    scopedRepairRequests,
    selectedId,
    simulators,
    visibleBranchIds,
  ]);

  useEffect(() => {
    expireSessionRef.current = (id) => value.stopSession(id, true);
  }, [value]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDashboardStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useDashboardStore must be used inside DashboardStoreProvider");
  return context;
}
