import { Booking } from "@/types/booking";
import { LogEntry } from "@/types/log";
import { Product } from "@/types/product";
import { RepairRequest, Simulator } from "@/types/simulator";
import { Branch, MockUser } from "@/types/user";

export const branches: Branch[] = [
  { id: "b2-main-arena", name: "B2 Main Arena" },
  { id: "b2-yunusabad", name: "B2 Yunusabad" },
  { id: "b2-chilonzor", name: "B2 Chilonzor" },
  { id: "b2-sergeli", name: "B2 Sergeli" },
  { id: "b2-samarqand", name: "B2 Samarqand" },
];

export const mockUsers: MockUser[] = [
  { id: "u-super-admin", name: "Super Admin", email: "superadmin@b2game.uz", role: "super_admin", branchIds: ["all"], password: "superadmin123" },
  { id: "u-admin", name: "Admin", email: "admin@b2game.uz", role: "admin", branchIds: ["b2-main-arena"], password: "admin123" },
];

export const tariffs = [
  { id: "t1", name: "Main 30 min", type: "Time-based", price: 30000 },
  { id: "t2", name: "Main 60 min", type: "Time-based", price: 50000 },
  { id: "t3", name: "VIP 30 min", type: "VIP", price: 60000 },
  { id: "t4", name: "VIP 60 min", type: "VIP", price: 100000 },
  { id: "t5", name: "Main 2+1", type: "Package", price: 100000 },
  { id: "t6", name: "Birthday Pack", type: "Birthday", price: 350000 },
  { id: "t7", name: "Night Pack", type: "Night", price: 200000 },
];

const branchOctet: Record<string, number> = {
  "b2-main-arena": 10,
  "b2-yunusabad": 20,
  "b2-chilonzor": 30,
  "b2-sergeli": 40,
  "b2-samarqand": 50,
};

const mainArenaRepairId = "repair-main-arena-main-05";

function simulatorStatus(branchIndex: number, number: number, zone: "Main" | "VIP") {
  if (branchIndex === 0 && zone === "Main" && number === 1) return "busy" as const;
  if (branchIndex === 0 && zone === "Main" && number === 2) return "reserved" as const;
  if (branchIndex === 0 && zone === "Main" && number === 3) return "unpaid" as const;
  if (branchIndex === 0 && zone === "Main" && number === 5) return "repair_requested" as const;
  if (branchIndex === 1 && zone === "VIP" && number === 2) return "fixing" as const;
  if (branchIndex === 2 && zone === "Main" && number === 8) return "broken" as const;
  if (branchIndex === 3 && zone === "Main" && number === 12) return "offline" as const;
  if (branchIndex === 4 && zone === "VIP" && number === 4) return "locked" as const;
  return "ready_to_play" as const;
}

function createSimulator(branch: Branch, branchIndex: number, zone: "Main" | "VIP", number: number): Simulator {
  const name = `${zone === "Main" ? "MAIN" : "VIP"}-${String(number).padStart(2, "0")}`;
  const status = simulatorStatus(branchIndex, number, zone);
  const isActive = ["busy", "unpaid"].includes(status);

  return {
    id: `${branch.id}-${name.toLowerCase()}`,
    name,
    type: zone,
    zone,
    branchId: branch.id,
    branchName: branch.name,
    status,
    deviceId: `B2-${branchIndex + 1}-${zone === "Main" ? "M" : "V"}-${String(number).padStart(2, "0")}`,
    ipAddress: `192.168.${branchOctet[branch.id]}.${zone === "Main" ? number + 10 : number + 80}`,
    currentUser: isActive ? (number === 1 ? "Aziz" : "Kamron") : status === "reserved" ? "Bekzod" : undefined,
    phone: isActive ? "998901112233" : undefined,
    tariff: zone === "VIP" ? "VIP 60 min" : "Main 60 min",
    startedAt: isActive ? "14:20" : undefined,
    remainingMinutes: status === "busy" ? 38 : 0,
    paidAmount: status === "busy" ? 50000 : status === "reserved" ? 20000 : 0,
    paymentStatus: status === "unpaid" ? "unpaid" : status === "reserved" ? "partial" : "paid",
    orderItems: status === "busy" ? ["Coca-Cola 0.5"] : [],
    repairRequestId: branch.id === "b2-main-arena" && zone === "Main" && number === 5 ? mainArenaRepairId : undefined,
  };
}

export const initialSimulators: Simulator[] = branches.flatMap((branch, branchIndex) => [
  ...Array.from({ length: 16 }, (_, index) => createSimulator(branch, branchIndex, "Main", index + 1)),
  ...Array.from({ length: 4 }, (_, index) => createSimulator(branch, branchIndex, "VIP", index + 1)),
]);

export const initialRepairRequests: RepairRequest[] = [
  {
    id: mainArenaRepairId,
    simulatorId: "b2-main-arena-main-05",
    simulatorName: "MAIN-05",
    branchId: "b2-main-arena",
    branchName: "B2 Main Arena",
    requestedBy: "Admin",
    requestedAt: "2026-06-03 10:15",
    title: "Wheel calibration error",
    description: "Main simulator does not start the game session because the wheel calibration fails on launch.",
    errorType: "device_error",
    priority: "high",
    note: "Customer session was moved to MAIN-06.",
    status: "pending",
    affectedRevenue: 50000,
  },
];

export const products: Product[] = [
  { id: "p1", name: "Coca-Cola 0.5", qrCode: "B2-QR-0001", price: 9000, stock: 72, category: "Ichimliklar", icon: "CC", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80" },
  { id: "p2", name: "Water 0.5", qrCode: "B2-QR-0002", price: 5000, stock: 90, category: "Ichimliklar", icon: "W", imageUrl: "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=700&q=80" },
  { id: "p3", name: "Burger", qrCode: "B2-QR-0003", price: 25000, stock: 18, category: "Fast food", icon: "BG", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80" },
  { id: "p4", name: "Energy Drink", qrCode: "B2-QR-0004", price: 15000, stock: 44, category: "Energy drink", icon: "ED", imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=700&q=80" },
  { id: "p5", name: "Chips", qrCode: "B2-QR-0005", price: 12000, stock: 31, category: "Snack", icon: "CH", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=80" },
  { id: "p6", name: "Main 60 min", qrCode: "B2-QR-0006", price: 50000, stock: 999, category: "Paketlar", icon: "M", imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=700&q=80" },
  { id: "p7", name: "Main 2+1 Paket", qrCode: "B2-QR-0007", price: 100000, stock: 999, category: "Paketlar", icon: "M2", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80" },
  { id: "p8", name: "VIP 30 min", qrCode: "B2-QR-0008", price: 60000, stock: 999, category: "Paketlar", icon: "V3", imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=700&q=80" },
  { id: "p9", name: "VIP 60 min", qrCode: "B2-QR-0009", price: 100000, stock: 999, category: "Paketlar", icon: "V6", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80" },
];

export const bookings: Booking[] = [
  { id: "b1", customerName: "Bekzod", phone: "998901234567", simulatorType: "Main", simulatorId: "b2-main-arena-main-02", date: "2026-06-03", startTime: "16:00", endTime: "17:00", tariff: "Main 60 min", prepayment: 20000, note: "Two players", status: "Confirmed" },
  { id: "b2", customerName: "Nilufar", phone: "998939998877", simulatorType: "VIP", simulatorId: "b2-main-arena-vip-03", date: "2026-06-03", startTime: "18:30", endTime: "20:00", tariff: "VIP 60 min", prepayment: 50000, note: "Birthday setup", status: "Pending" },
];

export const customers = [
  { name: "Aziz", phone: "998901112233", balance: 120000, bonus: 7000, lastVisit: "2026-06-03", totalSpent: 2350000, sessions: 38, status: "Active" },
  { name: "Madina", phone: "998935557788", balance: 45000, bonus: 3000, lastVisit: "2026-06-01", totalSpent: 840000, sessions: 13, status: "Active" },
  { name: "Kamron", phone: "998977771111", balance: 0, bonus: 0, lastVisit: "2026-05-29", totalSpent: 320000, sessions: 6, status: "Debt" },
];

export const initialLogs: LogEntry[] = [
  { id: "l1", time: "15:03", operator: "Admin", action: "started session on MAIN-01", simulator: "MAIN-01" },
  { id: "l2", time: "15:11", operator: "Admin", action: "received 50 000 by card", simulator: "MAIN-03", paymentMethod: "Karta" },
  { id: "l3", time: "15:18", operator: "Admin", action: "requested fix for MAIN-05", simulator: "MAIN-05" },
];

export const initialRevenueEvents = [
  { id: "r1", time: "09:20", amount: 18000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r2", time: "10:10", amount: 15000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r3", time: "11:05", amount: 22000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r4", time: "12:30", amount: 30000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r5", time: "13:15", amount: 24000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r6", time: "14:25", amount: 38000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r7", time: "15:11", amount: 50000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r8", time: "16:05", amount: 42000, source: "balance top-up", branchId: "b2-main-arena" },
  { id: "r9", time: "17:40", amount: 32000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r10", time: "18:10", amount: 48000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r11", time: "19:35", amount: 43000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r12", time: "20:05", amount: 50000, source: "session payment", branchId: "b2-main-arena" },
];

export const supportMessages = [
  { from: "Support", text: "Assalomu alaykum, B2 Game Club support online.", time: "14:01", own: false },
  { from: "Admin", text: "MAIN-05 wheel calibration error chiqyapti.", time: "14:03", own: true },
  { from: "Support Bot", text: "Repair request #B2-204 Super Admin ko'rib chiqishi uchun yaratildi.", time: "14:04", own: false },
];
