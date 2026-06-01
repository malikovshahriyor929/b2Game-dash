"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { bookings as bookingSeed, initialLogs, initialSimulators, products } from "@/lib/mock-data";
import { Booking } from "@/types/booking";
import { LogEntry } from "@/types/log";
import { OrderItem, Product } from "@/types/product";
import { Simulator } from "@/types/simulator";

type StartPayload = { customerName: string; phone: string; tariff: string; duration: number; amount: number; paymentStatus: "paid" | "unpaid" | "partial" };

type DashboardStore = {
  simulators: Simulator[];
  selectedId: string | null;
  selected?: Simulator;
  setSelectedId: (id: string | null) => void;
  revenue: number;
  logs: LogEntry[];
  products: Product[];
  order: OrderItem[];
  bookings: Booking[];
  startSession: (id: string, payload: StartPayload) => void;
  addTime: (id: string, minutes: number, amount: number, method: string) => void;
  pay: (id: string, amount: number, method: string) => void;
  stopSession: (id: string, override?: boolean) => void;
  setMaintenance: (id: string, value: boolean) => void;
  toggleLock: (id: string) => void;
  addBooking: (booking: Booking) => void;
  addProduct: (product: Product) => void;
  updateQty: (id: string, qty: number) => void;
  clearOrder: () => void;
  payOrder: (attachTo?: string) => void;
};

const StoreContext = createContext<DashboardStore | null>(null);

function now() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const [simulators, setSimulators] = useState(initialSimulators);
  const [selectedId, setSelectedId] = useState<string | null>(initialSimulators[0]?.id ?? null);
  const [logs, setLogs] = useState(initialLogs);
  const [revenue, setRevenue] = useState(390000);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [bookings, setBookings] = useState(bookingSeed);

  const operator = data?.user?.name ?? "operator";

  function appendLog(action: string, simulator?: string, paymentMethod?: string) {
    setLogs((items) => [{ id: crypto.randomUUID(), time: now(), operator, action, simulator, paymentMethod }, ...items]);
  }

  function patchSimulator(id: string, patch: Partial<Simulator>) {
    setSimulators((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  const value = useMemo<DashboardStore>(() => ({
    simulators,
    selectedId,
    selected: simulators.find((item) => item.id === selectedId),
    setSelectedId,
    revenue,
    logs,
    products,
    order,
    bookings,
    startSession(id, payload) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator || ["offline", "maintenance", "locked"].includes(simulator.status)) return;
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
      if (payload.paymentStatus === "paid") setRevenue((current) => current + payload.amount);
      appendLog(`started session on ${simulator.name}`, simulator.name);
    },
    addTime(id, minutes, amount, method) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { remainingMinutes: simulator.remainingMinutes + minutes, paidAmount: simulator.paidAmount + amount, paymentStatus: "paid", status: "busy" });
      setRevenue((current) => current + amount);
      appendLog(`added ${minutes} min to ${simulator.name}`, simulator.name, method);
    },
    pay(id, amount, method) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { paidAmount: simulator.paidAmount + amount, paymentStatus: "paid", status: simulator.status === "unpaid" ? "busy" : simulator.status });
      setRevenue((current) => current + amount);
      appendLog(`received ${amount.toLocaleString("uz-UZ")} by ${method}`, simulator.name, method);
    },
    stopSession(id, override) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator || (simulator.paymentStatus !== "paid" && !override)) return;
      patchSimulator(id, { status: "free", currentUser: undefined, phone: undefined, tariff: undefined, startedAt: undefined, remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] });
      appendLog(`stopped session on ${simulator.name}`, simulator.name);
    },
    setMaintenance(id, active) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { status: active ? "maintenance" : "free" });
      appendLog(active ? `moved ${simulator.name} to maintenance` : `marked ${simulator.name} available`, simulator.name);
    },
    toggleLock(id) {
      const simulator = simulators.find((item) => item.id === id);
      if (!simulator) return;
      patchSimulator(id, { status: simulator.status === "locked" ? "free" : "locked" });
      appendLog(`${simulator.status === "locked" ? "unlocked" : "locked"} ${simulator.name}`, simulator.name);
    },
    addBooking(booking) {
      setBookings((items) => [booking, ...items]);
      patchSimulator(booking.simulatorId, { status: "reserved", currentUser: booking.customerName, paidAmount: booking.prepayment, paymentStatus: booking.prepayment ? "partial" : "unpaid" });
      appendLog(`created booking for ${booking.simulatorId}`, booking.simulatorId);
    },
    addProduct(product) {
      setOrder((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) return items.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        return [...items, { ...product, qty: 1 }];
      });
    },
    updateQty(id, qty) {
      setOrder((items) => (qty <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, qty } : item))));
    },
    clearOrder() {
      setOrder([]);
    },
    payOrder(attachTo) {
      const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (!total) return;
      setRevenue((current) => current + total);
      if (attachTo) {
        const names = order.map((item) => item.name).join(", ");
        const simulator = simulators.find((item) => item.id === attachTo);
        patchSimulator(attachTo, { orderItems: [...(simulator?.orderItems ?? []), names] });
      }
      appendLog(`paid shop order ${total.toLocaleString("uz-UZ")}`, attachTo);
      setOrder([]);
    },
  }), [bookings, logs, order, operator, products, revenue, selectedId, simulators]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDashboardStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useDashboardStore must be used inside DashboardStoreProvider");
  return context;
}
