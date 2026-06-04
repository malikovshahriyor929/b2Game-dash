"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  bookings as bookingSeed,
  branches,
  initialLogs,
  initialRepairRequests,
  initialRevenueEvents,
  initialSimulators,
  products,
  initialShifts,
  initialLockUnlockLogs,
  initialBarSales,
  initialCashTransactions,
} from "@/lib/mock-data";
import { Booking } from "@/types/booking";
import { LogEntry, LockUnlockEntry } from "@/types/log";
import { OrderItem, Product, BarSale } from "@/types/product";
import { RepairErrorType, RepairPriority, RepairRequest, Simulator } from "@/types/simulator";
import { CashTransaction, Shift } from "@/types/report";

type StartPayload = { customerName: string; phone: string; tariff: string; duration: number; amount: number; paymentStatus: "paid" | "unpaid" | "partial" };
type PeriodFilter = "today" | "yesterday" | "week" | "month" | "year" | "custom";
type RepairPayload = { title: string; description: string; errorType: RepairErrorType; priority: RepairPriority; note?: string };
type RevenueEvent = { id: string; time: string; date?: string; amount: number; source: string; branchId?: string };


type DashboardStore = {
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
  branches: typeof branches;
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
  createProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, product: Omit<Product, "id">) => Product | null;
  deleteProduct: (id: string) => void;
  recordCashierTransaction: (action: string, amount: number, method: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearOrder: () => void;
  payOrder: (attachTo?: string, paymentMethod?: string) => void;
  openShift: (operator: string, shiftType: "Kunduzgi (09:00 - 18:00)" | "Tungi (18:01 - 09:00)", startingCash: number) => void;
  closeShift: (actualCash: number, notes?: string) => void;
  addCashTransaction: (type: "income" | "expense", amount: number, source: string, method: string) => void;
};


const StoreContext = createContext<DashboardStore | null>(null);

function now() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const [allSimulators, setAllSimulators] = useState(initialSimulators);
  const [selectedId, setSelectedId] = useState<string | null>(initialSimulators[0]?.id ?? null);
  const [logs, setLogs] = useState(initialLogs);
  const [lockUnlockLogs, setLockUnlockLogs] = useState<LockUnlockEntry[]>(initialLockUnlockLogs);
  const [barSales, setBarSales] = useState<BarSale[]>(initialBarSales);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(initialCashTransactions);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [customStartDate, setCustomStartDate] = useState("2026-06-04");
  const [customEndDate, setCustomEndDate] = useState("2026-06-04");
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>(initialRevenueEvents);
  const [repairRequests, setRepairRequests] = useState(initialRepairRequests);
  const [revenue, setRevenue] = useState(390000);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [inventory, setInventory] = useState<Product[]>(products);
  const [bookings, setBookings] = useState(bookingSeed);
  const defaultBranchId = data?.user?.role === "super_admin" ? "all" : data?.user?.branchIds?.[0] ?? branches[0].id;
  const [selectedBranchId, setSelectedBranchIdState] = useState(defaultBranchId);
  const [period, setPeriod] = useState<PeriodFilter>("today");


  const operator = data?.user?.name ?? "Admin";
  const role = data?.user?.role;
  const allowedBranchIds = data?.user?.branchIds ?? [];
  const canUseAllBranches = role === "super_admin";
  const effectiveBranchId = canUseAllBranches ? selectedBranchId : allowedBranchIds[0] ?? branches[0].id;
  const visibleBranchIds = effectiveBranchId === "all" ? branches.map((branch) => branch.id) : [effectiveBranchId];
  const simulators = allSimulators.filter((item) => visibleBranchIds.includes(item.branchId));
  const scopedRepairRequests = repairRequests.filter((item) => visibleBranchIds.includes(item.branchId));

  useEffect(() => {
    if (!data?.user) return;
    const nextBranchId = data.user.role === "super_admin" ? "all" : data.user.branchIds[0] ?? branches[0].id;
    setSelectedBranchIdState((current) => (data.user.role === "super_admin" && current !== branches[0].id ? current : nextBranchId));
  }, [data?.user]);

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

  function setSelectedBranchId(id: string) {
    if (!canUseAllBranches) return;
    setSelectedBranchIdState(id);
    const first = id === "all" ? allSimulators[0] : allSimulators.find((item) => item.branchId === id);
    setSelectedId(first?.id ?? null);
  }

  const activeShift = useMemo(() => shifts.find((item) => item.status === "open") ?? null, [shifts]);

  const value = useMemo<DashboardStore>(() => ({
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
    branches,
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
      patchSimulator(id, {
        status: "busy",
        currentUser: payload.customerName || "Guest",
        phone: payload.phone,
        tariff: payload.tariff,
        startedAt: now(),
        remainingMinutes: payload.duration,
        paidAmount: payload.paymentStatus === "paid" ? payload.amount : 0,
        paymentStatus: payload.paymentStatus,
      });
      if (payload.paymentStatus === "paid") recordRevenue(payload.amount, `session started ${simulator.name}`, simulator.branchId);
      appendLog(`started session on ${simulator.name}`, simulator.name);
    },
    addTime(id, minutes, amount, method) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { remainingMinutes: simulator.remainingMinutes + minutes, paidAmount: simulator.paidAmount + amount, paymentStatus: "paid", status: "busy" });
      recordRevenue(amount, `added time ${simulator.name}`, simulator.branchId);
      appendLog(`added ${minutes} min to ${simulator.name}`, simulator.name, method);
    },
    pay(id, amount, method) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { paidAmount: simulator.paidAmount + amount, paymentStatus: "paid", status: simulator.status === "unpaid" ? "busy" : simulator.status });
      recordRevenue(amount, `session payment ${simulator.name}`, simulator.branchId);
      appendLog(`received ${amount.toLocaleString("uz-UZ")} by ${method}`, simulator.name, method);
    },
    stopSession(id, override) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || (simulator.paymentStatus !== "paid" && !override)) return;
      patchSimulator(id, { status: "ready_to_play", currentUser: undefined, phone: undefined, tariff: undefined, startedAt: undefined, remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] });
      appendLog(`stopped session on ${simulator.name}`, simulator.name);
    },
    toggleLock(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator) return;
      const isLocked = simulator.status === "locked";
      const nextStatus = isLocked ? "ready_to_play" : "locked";
      patchSimulator(id, { status: nextStatus });
      appendLog(`${isLocked ? "unlocked" : "locked"} ${simulator.name}`, simulator.name);

      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = d.toISOString().split("T")[0];
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
      setRepairRequests((items) => [request, ...items]);
      patchSimulator(id, { status: "repair_requested", repairRequestId: request.id });
      appendLog(`requested fix for ${simulator.name}`, simulator.name);
    },
    approveRepair(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      patchRepair(requestId, { status: "approved", approvedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "repair_approved" });
      appendLog(`approved repair for ${request.simulatorName}`, request.simulatorName);
    },
    rejectRepair(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      patchRepair(requestId, { status: "rejected", rejectedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "broken" });
      appendLog(`rejected repair for ${request.simulatorName}`, request.simulatorName);
    },
    askRepairDetails(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      patchRepair(requestId, { status: "more_details_requested" });
      appendLog(`asked for more details on ${request.simulatorName}`, request.simulatorName);
    },
    startFixing(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || simulator.status !== "repair_approved") return;
      patchSimulator(id, { status: "fixing" });
      if (simulator.repairRequestId) patchRepair(simulator.repairRequestId, { status: "fixing", fixingStartedAt: new Date().toLocaleString("uz-UZ") });
      appendLog(`started fixing ${simulator.name}`, simulator.name);
    },
    markFixed(id) {
      const simulator = allSimulators.find((item) => item.id === id);
      if (!simulator || simulator.status !== "fixing") return;
      patchSimulator(id, { status: "fixed_waiting_confirmation" });
      if (simulator.repairRequestId) patchRepair(simulator.repairRequestId, { status: "fixed_waiting_confirmation", fixedAt: new Date().toLocaleString("uz-UZ") });
      appendLog(`marked ${simulator.name} fixed and waiting confirmation`, simulator.name);
    },
    confirmFixed(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      patchRepair(requestId, { status: "confirmed_fixed", confirmedAt: new Date().toLocaleString("uz-UZ") });
      patchSimulator(request.simulatorId, { status: "ready_to_play", repairRequestId: undefined });
      appendLog(`confirmed fixed ${request.simulatorName}`, request.simulatorName);
    },
    rejectFix(requestId) {
      const request = repairRequests.find((item) => item.id === requestId);
      if (!request || role !== "super_admin") return;
      patchRepair(requestId, { status: "fixing" });
      patchSimulator(request.simulatorId, { status: "fixing" });
      appendLog(`rejected fix confirmation for ${request.simulatorName}`, request.simulatorName);
    },
    addBooking(booking) {
      setBookings((items) => [booking, ...items]);
      patchSimulator(booking.simulatorId, { status: "reserved", currentUser: booking.customerName, paidAmount: booking.prepayment, paymentStatus: booking.prepayment ? "partial" : "unpaid" });
      appendLog(`created booking for ${booking.simulatorId}`, booking.simulatorId);
    },
    updateBooking(booking) {
      setBookings((items) => items.map((item) => (item.id === booking.id ? booking : item)));
      patchSimulator(booking.simulatorId, { status: booking.status === "Cancelled" ? "ready_to_play" : "reserved", currentUser: booking.status === "Cancelled" ? undefined : booking.customerName, paidAmount: booking.status === "Cancelled" ? 0 : booking.prepayment, paymentStatus: booking.prepayment ? "partial" : "unpaid" });
      appendLog(`updated booking for ${booking.simulatorId}`, booking.simulatorId);
    },
    deleteBooking(id) {
      const booking = bookings.find((item) => item.id === id);
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
      setInventory((items) => items.map((item) => (item.id === product.id && item.stock < 999 ? { ...item, stock: Math.max(item.stock - 1, 0) } : item)));
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
      setInventory((items) => items.map((item) => (item.id === product.id && item.stock < 999 ? { ...item, stock: Math.max(item.stock - 1, 0) } : item)));
      appendLog(`scanned product ${product.name}`);
      return product;
    },
    createProduct(product) {
      const created = { ...product, id: crypto.randomUUID() };
      setInventory((items) => [created, ...items]);
      appendLog(`created product ${created.name} with QR ${created.qrCode}`);
      return created;
    },
    updateProduct(id, product) {
      const existing = inventory.find((item) => item.id === id);
      if (!existing) return null;
      const updated = { ...product, id };
      setInventory((items) => items.map((item) => (item.id === id ? updated : item)));
      setOrder((items) => items.map((item) => (item.id === id ? { ...updated, qty: item.qty } : item)));
      appendLog(`updated product ${updated.name} with QR ${updated.qrCode}`);
      return updated;
    },
    deleteProduct(id) {
      const existing = inventory.find((item) => item.id === id);
      setInventory((items) => items.filter((item) => item.id !== id));
      setOrder((items) => items.filter((item) => item.id !== id));
      if (existing) appendLog(`deleted product ${existing.name}`);
    },
    recordCashierTransaction(action, amount, method) {
      if (!Number.isFinite(amount) || amount <= 0) return;
      recordRevenue(amount, action);
      appendLog(`${action} ${amount.toLocaleString("uz-UZ")}`, undefined, method);
    },
    updateQty(id, qty) {
      setOrder((items) => (qty <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, qty } : item))));
    },
    clearOrder() {
      setOrder([]);
    },
    payOrder(attachTo, paymentMethod = "Karta") {
      const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (!total) return;
      const simulator = attachTo ? allSimulators.find((item) => item.id === attachTo) : undefined;
      recordRevenue(total, "shop order", simulator?.branchId);
      if (attachTo) {
        const names = order.map((item) => item.name).join(", ");
        patchSimulator(attachTo, { orderItems: [...(simulator?.orderItems ?? []), names] });
      }
      appendLog(`paid shop order ${total.toLocaleString("uz-UZ")}`, attachTo);

      // Record a detailed BarSale
      const d = new Date();
      const timeStr = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      const dateStr = d.toISOString().split("T")[0];

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
        branchId: simulator?.branchId ?? branches[0].id,
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
      const dateStr = d.toISOString().split("T")[0];
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
      const dateStr = d.toISOString().split("T")[0];
      const newTx: CashTransaction = {
        id: crypto.randomUUID(),
        type,
        amount,
        source,
        operator,
        date: dateStr,
        time: timeStr,
        paymentMethod: method,
        branchId: effectiveBranchId === "all" ? branches[0].id : effectiveBranchId,
        shiftId: activeShift?.id ?? undefined,
      };
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
  }), [
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

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDashboardStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useDashboardStore must be used inside DashboardStoreProvider");
  return context;
}
