import { Booking } from "@/types/booking";
import { LogEntry, LockUnlockEntry } from "@/types/log";
import { Product, BarSale } from "@/types/product";
import { RepairRequest, Simulator } from "@/types/simulator";
import { Branch, MockUser } from "@/types/user";
import { CashTransaction, Shift } from "@/types/report";


export const branches: Branch[] = [
  { id: "b2-main-arena", name: "B2 Main Arena" },
];

export const mockUsers: MockUser[] = [
  { id: "u-super-admin", name: "Super Admin", email: "superadmin@b2game.uz", role: "super_admin", branchIds: ["all"], password: "superadmin123" },
  { id: "u-admin", name: "Admin", email: "admin@b2game.uz", role: "admin", branchIds: ["b2-main-arena"], password: "admin123" },
];

export const tariffs = [
  { id: "t1", name: "Logitech 30 min", type: "Standard", price: 30000 },
  { id: "t2", name: "Logitech 60 min", type: "Standard", price: 50000 },
  { id: "t3", name: "Moza VIP 30 min", type: "VIP", price: 60000 },
  { id: "t4", name: "Moza VIP 60 min", type: "VIP", price: 100000 },
  { id: "t5", name: "Logitech 2+1", type: "Package", price: 100000 },
  { id: "t6", name: "Birthday Pack", type: "Birthday", price: 350000 },
  { id: "t7", name: "Night Pack", type: "Night", price: 200000 },
];

const mainArenaRepairId = "repair-logitech-05";

function simulatorStatus(number: number, zone: "Standard" | "VIP") {
  if (zone === "Standard" && number === 1) return "busy" as const;
  if (zone === "Standard" && number === 2) return "reserved" as const;
  if (zone === "Standard" && number === 3) return "unpaid" as const;
  if (zone === "Standard" && number === 5) return "repair_requested" as const;
  return "ready_to_play" as const;
}

function createSimulator(branch: Branch, zone: "Standard" | "VIP", number: number): Simulator {
  const prefix = zone === "Standard" ? "LOGITECH" : "MOZA";
  const name = `${prefix}-${String(number).padStart(2, "0")}`;
  const status = simulatorStatus(number, zone);
  const isActive = ["busy", "unpaid"].includes(status);

  return {
    id: `${branch.id}-${prefix.toLowerCase()}-${String(number).padStart(2, "0")}`,
    name,
    type: zone,
    zone,
    branchId: branch.id,
    branchName: branch.name,
    status,
    deviceId: `B2-${zone === "Standard" ? "LOG" : "MOZA"}-${String(number).padStart(2, "0")}`,
    ipAddress: `192.168.10.${zone === "Standard" ? number + 10 : number + 80}`,
    currentUser: isActive ? (number === 1 ? "Aziz" : "Kamron") : status === "reserved" ? "Bekzod" : undefined,
    phone: isActive ? "998901112233" : undefined,
    tariff: zone === "VIP" ? "Moza VIP 60 min" : "Logitech 60 min",
    startedAt: isActive ? "14:20" : undefined,
    remainingMinutes: status === "busy" ? 38 : 0,
    paidAmount: status === "busy" ? 50000 : status === "reserved" ? 20000 : 0,
    paymentStatus: status === "unpaid" ? "unpaid" : status === "reserved" ? "partial" : "paid",
    orderItems: status === "busy" ? ["Coca-Cola 0.5"] : [],
    repairRequestId: zone === "Standard" && number === 5 ? mainArenaRepairId : undefined,
  };
}

export const initialSimulators: Simulator[] = [
  ...Array.from({ length: 16 }, (_, index) => createSimulator(branches[0], "Standard", index + 1)),
  ...Array.from({ length: 4 }, (_, index) => createSimulator(branches[0], "VIP", index + 1)),
];

export const initialRepairRequests: RepairRequest[] = [
  {
    id: mainArenaRepairId,
    simulatorId: "b2-main-arena-logitech-05",
    simulatorName: "LOGITECH-05",
    branchId: "b2-main-arena",
    branchName: "B2 Main Arena",
    requestedBy: "Admin",
    requestedAt: "2026-06-03 10:15",
    title: "Wheel calibration error",
    description: "Logitech Standard simulator does not start the game session because the wheel calibration fails on launch.",
    errorType: "device_error",
    priority: "high",
    note: "Customer session was moved to LOGITECH-06.",
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
  { id: "p6", name: "Logitech 60 min", qrCode: "B2-QR-0006", price: 50000, stock: 999, category: "Paketlar", icon: "L6", imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=700&q=80" },
  { id: "p7", name: "Logitech 2+1 Paket", qrCode: "B2-QR-0007", price: 100000, stock: 999, category: "Paketlar", icon: "L2", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80" },
  { id: "p8", name: "Moza VIP 30 min", qrCode: "B2-QR-0008", price: 60000, stock: 999, category: "Paketlar", icon: "V3", imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=700&q=80" },
  { id: "p9", name: "Moza VIP 60 min", qrCode: "B2-QR-0009", price: 100000, stock: 999, category: "Paketlar", icon: "V6", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80" },
];

export const bookings: Booking[] = [
  { id: "b1", customerName: "Bekzod", phone: "998901234567", simulatorType: "Standard", simulatorId: "b2-main-arena-logitech-02", date: "2026-06-03", startTime: "16:00", endTime: "17:00", tariff: "Logitech 60 min", prepayment: 20000, note: "Two players", status: "Confirmed" },
  { id: "b2", customerName: "Nilufar", phone: "998939998877", simulatorType: "VIP", simulatorId: "b2-main-arena-moza-03", date: "2026-06-03", startTime: "18:30", endTime: "20:00", tariff: "Moza VIP 60 min", prepayment: 50000, note: "Birthday setup", status: "Pending" },
];

export const customers = [
  { name: "Aziz", phone: "998901112233", balance: 120000, bonus: 7000, lastVisit: "2026-06-03", totalSpent: 2350000, sessions: 38, status: "Active" },
  { name: "Madina", phone: "998935557788", balance: 45000, bonus: 3000, lastVisit: "2026-06-01", totalSpent: 840000, sessions: 13, status: "Active" },
  { name: "Kamron", phone: "998977771111", balance: 0, bonus: 0, lastVisit: "2026-05-29", totalSpent: 320000, sessions: 6, status: "Debt" },
];

export const initialLogs: LogEntry[] = [
  { id: "l1", time: "15:03", operator: "Admin", action: "started session on LOGITECH-01", simulator: "LOGITECH-01" },
  { id: "l2", time: "15:11", operator: "Admin", action: "received 50 000 by card", simulator: "LOGITECH-03", paymentMethod: "Karta" },
  { id: "l3", time: "15:18", operator: "Admin", action: "requested fix for LOGITECH-05", simulator: "LOGITECH-05" },
];

export const initialRevenueEvents = [
  { id: "r1", time: "09:20", date: "2026-06-04", amount: 18000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r2", time: "10:10", date: "2026-06-04", amount: 15000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r3", time: "11:05", date: "2026-06-04", amount: 22000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r4", time: "12:30", date: "2026-06-04", amount: 30000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r5", time: "13:15", date: "2026-06-04", amount: 24000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r6", time: "14:25", date: "2026-06-04", amount: 38000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r7", time: "15:11", date: "2026-06-04", amount: 50000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r8", time: "16:05", date: "2026-06-04", amount: 42000, source: "balance top-up", branchId: "b2-main-arena" },
  { id: "r9", time: "17:40", date: "2026-06-04", amount: 32000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r10", time: "18:10", date: "2026-06-04", amount: 48000, source: "session payment", branchId: "b2-main-arena" },
  { id: "r11", time: "19:35", date: "2026-06-04", amount: 43000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r12", time: "20:05", date: "2026-06-04", amount: 50000, source: "session payment", branchId: "b2-main-arena" },

  // July 2nd revenue events
  { id: "r13", time: "09:30", date: "2026-07-02", amount: 120000, source: "Cash In: PlayStation turnir homiylik to'lovi", branchId: "b2-main-arena" },
  { id: "r14", time: "10:30", date: "2026-07-02", amount: 30000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r15", time: "14:15", date: "2026-07-02", amount: 80000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r16", time: "15:30", date: "2026-07-02", amount: -45000, source: "Expense: Simulator uchun yangi HDMI kabel xaridi", branchId: "b2-main-arena" },
  { id: "r17", time: "20:45", date: "2026-07-02", amount: 51000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r18", time: "22:15", date: "2026-07-02", amount: 80000, source: "Cash In: Mijozdan kech qolganlik uchun jarima to'lovi", branchId: "b2-main-arena" },
  { id: "r19", time: "23:45", date: "2026-07-02", amount: -110000, source: "Expense: Tungi smena ovqat xarajatlari", branchId: "b2-main-arena" },

  // July 3rd revenue events
  { id: "r20", time: "11:00", date: "2026-07-03", amount: 102000, source: "shop sale", branchId: "b2-main-arena" },
  { id: "r21", time: "11:45", date: "2026-07-03", amount: 200000, source: "Cash In: VIP xonani bron qilish depoziti", branchId: "b2-main-arena" },
  { id: "r22", time: "14:20", date: "2026-07-03", amount: -85000, source: "Expense: Kantselyariya va qog'oz sotib olindi", branchId: "b2-main-arena" },
  { id: "r23", time: "16:20", date: "2026-07-03", amount: 48000, source: "shop sale", branchId: "b2-main-arena" },
];

export const supportMessages = [
  { from: "Support", text: "Assalomu alaykum, B2 Game Club support online.", time: "14:01", own: false },
  { from: "Admin", text: "LOGITECH-05 wheel calibration error chiqyapti.", time: "14:03", own: true },
  { from: "Support Bot", text: "Repair request #B2-204 Super Admin ko'rib chiqishi uchun yaratildi.", time: "14:04", own: false },
];

export const initialShifts: Shift[] = [
  // July 2nd Shifts
  {
    id: "s-jul2-day",
    operator: "Admin",
    date: "2026-07-02",
    shiftType: "Kunduzgi (09:00 - 18:00)",
    status: "closed",
    openTime: "09:00",
    closeTime: "18:00",
    startingCash: 150000,
    expectedCash: 385000,
    actualCash: 385000,
    discrepancy: 0,
    cardRevenue: 420000,
    qrRevenue: 90000,
    totalIncome: 120000, // custom prixod
    totalExpense: 45000, // custom rasxod
    notes: "Everything went smoothly."
  },
  {
    id: "s-jul2-night",
    operator: "Admin",
    date: "2026-07-02",
    shiftType: "Tungi (18:01 - 09:00)",
    status: "closed",
    openTime: "18:01",
    closeTime: "09:00",
    startingCash: 385000,
    expectedCash: 620000,
    actualCash: 615000,
    discrepancy: -5000,
    cardRevenue: 310000,
    qrRevenue: 60000,
    totalIncome: 80000,
    totalExpense: 110000,
    notes: "Discrepancy due to minor cash refund issue."
  },
  // July 3rd Shifts
  {
    id: "s-jul3-day",
    operator: "Admin",
    date: "2026-07-03",
    shiftType: "Kunduzgi (09:00 - 18:00)",
    status: "closed",
    openTime: "09:00",
    closeTime: "18:00",
    startingCash: 615000,
    expectedCash: 950000,
    actualCash: 950000,
    discrepancy: 0,
    cardRevenue: 510000,
    qrRevenue: 120000,
    totalIncome: 200000,
    totalExpense: 85000,
    notes: "High simulator traffic."
  },
  // Today's Shift (June 4th)
  {
    id: "s-jun4-day",
    operator: "Admin",
    date: "2026-06-04",
    shiftType: "Kunduzgi (09:00 - 18:00)",
    status: "open",
    openTime: "09:00",
    startingCash: 200000,
    cardRevenue: 210000,
    qrRevenue: 90000,
    totalIncome: 120000,
    totalExpense: 25000
  }
];

export const initialLockUnlockLogs: LockUnlockEntry[] = [
  { id: "lu1", time: "09:15", date: "2026-07-02", operator: "Admin", simulator: "LOGITECH-01", action: "unlock" },
  { id: "lu2", time: "11:30", date: "2026-07-02", operator: "Admin", simulator: "LOGITECH-03", action: "lock" },
  { id: "lu3", time: "14:45", date: "2026-07-02", operator: "Admin", simulator: "MOZA-02", action: "lock" },
  { id: "lu4", time: "18:20", date: "2026-07-02", operator: "Admin", simulator: "LOGITECH-02", action: "unlock" },
  
  { id: "lu5", time: "10:05", date: "2026-07-03", operator: "Admin", simulator: "LOGITECH-08", action: "lock" },
  { id: "lu6", time: "12:15", date: "2026-07-03", operator: "Admin", simulator: "LOGITECH-08", action: "unlock" },
  { id: "lu7", time: "15:40", date: "2026-07-03", operator: "Admin", simulator: "MOZA-04", action: "lock" },

  { id: "lu8", time: "09:30", date: "2026-06-04", operator: "Admin", simulator: "LOGITECH-01", action: "lock" },
  { id: "lu9", time: "11:15", date: "2026-06-04", operator: "Admin", simulator: "LOGITECH-01", action: "unlock" }
];

export const initialBarSales: BarSale[] = [
  // July 2nd sales
  {
    id: "bs1",
    date: "2026-07-02",
    time: "10:30",
    operator: "Admin",
    items: [
      { productId: "p1", name: "Coca-Cola 0.5", qty: 2, price: 9000 },
      { productId: "p5", name: "Chips", qty: 1, price: 12000 }
    ],
    totalAmount: 30000,
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-day"
  },
  {
    id: "bs2",
    date: "2026-07-02",
    time: "14:15",
    operator: "Admin",
    items: [
      { productId: "p3", name: "Burger", qty: 2, price: 25000 },
      { productId: "p4", name: "Energy Drink", qty: 2, price: 15000 }
    ],
    totalAmount: 80000,
    paymentMethod: "Karta",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-day"
  },
  {
    id: "bs3",
    date: "2026-07-02",
    time: "20:45",
    operator: "Admin",
    items: [
      { productId: "p1", name: "Coca-Cola 0.5", qty: 3, price: 9000 },
      { productId: "p5", name: "Chips", qty: 2, price: 12000 }
    ],
    totalAmount: 51000,
    paymentMethod: "QR",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-night"
  },

  // July 3rd sales
  {
    id: "bs4",
    date: "2026-07-03",
    time: "11:00",
    operator: "Admin",
    items: [
      { productId: "p3", name: "Burger", qty: 3, price: 25000 },
      { productId: "p1", name: "Coca-Cola 0.5", qty: 3, price: 9000 }
    ],
    totalAmount: 102000,
    paymentMethod: "Karta",
    branchId: "b2-main-arena",
    shiftId: "s-jul3-day"
  },
  {
    id: "bs5",
    date: "2026-07-03",
    time: "16:20",
    operator: "Admin",
    items: [
      { productId: "p5", name: "Chips", qty: 4, price: 12000 }
    ],
    totalAmount: 48000,
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul3-day"
  },

  // June 4th (Today) sales
  {
    id: "bs6",
    date: "2026-06-04",
    time: "10:10",
    operator: "Admin",
    items: [
      { productId: "p1", name: "Coca-Cola 0.5", qty: 1, price: 9000 },
      { productId: "p2", name: "Water 0.5", qty: 1, price: 5000 }
    ],
    totalAmount: 14000,
    paymentMethod: "Karta",
    branchId: "b2-main-arena",
    shiftId: "s-jun4-day"
  }
];

export const initialCashTransactions: CashTransaction[] = [
  // July 2nd Cash Transactions
  {
    id: "ct1",
    type: "income",
    amount: 120000,
    source: "PlayStation turnir homiylik to'lovi",
    operator: "Admin",
    date: "2026-07-02",
    time: "10:00",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-day"
  },
  {
    id: "ct2",
    type: "expense",
    amount: 45000,
    source: "Simulator uchun yangi HDMI kabel xaridi",
    operator: "Admin",
    date: "2026-07-02",
    time: "15:30",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-day"
  },
  {
    id: "ct3",
    type: "income",
    amount: 80000,
    source: "Mijozdan kech qolganlik uchun jarima to'lovi",
    operator: "Admin",
    date: "2026-07-02",
    time: "22:15",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-night"
  },
  {
    id: "ct4",
    type: "expense",
    amount: 110000,
    source: "Tungi smena ovqat xarajatlari",
    operator: "Admin",
    date: "2026-07-02",
    time: "23:45",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul2-night"
  },

  // July 3rd Cash Transactions
  {
    id: "ct5",
    type: "income",
    amount: 200000,
    source: "VIP xonani bron qilish depoziti",
    operator: "Admin",
    date: "2026-07-03",
    time: "11:45",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul3-day"
  },
  {
    id: "ct6",
    type: "expense",
    amount: 85000,
    source: "Kantselyariya va qog'oz sotib olindi",
    operator: "Admin",
    date: "2026-07-03",
    time: "14:20",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jul3-day"
  },

  // June 4th (Today) Cash Transactions
  {
    id: "ct7",
    type: "income",
    amount: 120000,
    source: "Balans to'ldirish (Qo'shimcha bonus xizmat)",
    operator: "Admin",
    date: "2026-06-04",
    time: "09:30",
    paymentMethod: "Karta",
    branchId: "b2-main-arena",
    shiftId: "s-jun4-day"
  },
  {
    id: "ct8",
    type: "expense",
    amount: 25000,
    source: "Ofis tozalash vositalari",
    operator: "Admin",
    date: "2026-06-04",
    time: "11:00",
    paymentMethod: "Naqd",
    branchId: "b2-main-arena",
    shiftId: "s-jun4-day"
  }
];

