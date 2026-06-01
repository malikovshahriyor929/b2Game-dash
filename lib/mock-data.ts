import { Booking } from "@/types/booking";
import { LogEntry } from "@/types/log";
import { Product } from "@/types/product";
import { Simulator } from "@/types/simulator";
import { MockUser } from "@/types/user";

export const mockUsers: MockUser[] = [
  { id: "u-admin", name: "admin", phone: "900000001", role: "Admin", password: "admin123" },
  { id: "u-cashier", name: "test_kassir", phone: "900000002", role: "Cashier", password: "cashier123" },
  { id: "u-operator", name: "operator", phone: "900000003", role: "Operator", password: "operator123" },
  { id: "u-tech", name: "technician", phone: "900000004", role: "Technician", password: "tech123" },
];

export const tariffs = [
  { id: "t1", name: "Racing 30 min", type: "Time-based", price: 30000 },
  { id: "t2", name: "Racing 60 min", type: "Time-based", price: 50000 },
  { id: "t3", name: "VR 30 min", type: "VIP", price: 45000 },
  { id: "t4", name: "PS5 60 min", type: "Time-based", price: 40000 },
  { id: "t5", name: "VIP Room 1 hour", type: "VIP", price: 100000 },
  { id: "t6", name: "Racing 2+1", type: "Package", price: 100000 },
  { id: "t7", name: "Birthday Pack", type: "Birthday", price: 350000 },
  { id: "t8", name: "Night Pack", type: "Night", price: 200000 },
];

export const initialSimulators: Simulator[] = [
  { id: "race-01", name: "RACE-01", type: "Racing", zone: "Main Racing Zone", status: "busy", deviceId: "B2-RC-001", ipAddress: "192.168.10.21", currentUser: "Aziz", phone: "998901112233", tariff: "Racing 60 min", startedAt: "14:20", remainingMinutes: 38, paidAmount: 50000, paymentStatus: "paid", orderItems: ["Coca-Cola 0.5"] },
  { id: "race-02", name: "RACE-02", type: "Racing", zone: "Main Racing Zone", status: "ending_soon", deviceId: "B2-RC-002", ipAddress: "192.168.10.22", currentUser: "Sardor", tariff: "Racing 30 min", startedAt: "15:05", remainingMinutes: 7, paidAmount: 30000, paymentStatus: "paid", orderItems: [] },
  { id: "race-03", name: "RACE-03", type: "Racing", zone: "Main Racing Zone", status: "free", deviceId: "B2-RC-003", ipAddress: "192.168.10.23", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "race-04", name: "RACE-04", type: "Racing", zone: "Main Racing Zone", status: "reserved", deviceId: "B2-RC-004", ipAddress: "192.168.10.24", currentUser: "Bekzod", remainingMinutes: 0, paidAmount: 20000, paymentStatus: "partial", orderItems: [] },
  { id: "race-05", name: "RACE-05", type: "Racing", zone: "Main Racing Zone", status: "maintenance", deviceId: "B2-RC-005", ipAddress: "192.168.10.25", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "vr-01", name: "VR-01", type: "VR", zone: "VR Zone", status: "busy", deviceId: "B2-VR-001", ipAddress: "192.168.10.31", currentUser: "Madina", tariff: "VR 30 min", startedAt: "15:10", remainingMinutes: 22, paidAmount: 0, paymentStatus: "unpaid", orderItems: ["Energy Drink"] },
  { id: "vr-02", name: "VR-02", type: "VR", zone: "VR Zone", status: "free", deviceId: "B2-VR-002", ipAddress: "192.168.10.32", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "ps5-01", name: "PS5-01", type: "PS5 / Console", zone: "Console Zone", status: "busy", deviceId: "B2-PS-001", ipAddress: "192.168.10.41", currentUser: "Jasur", tariff: "PS5 60 min", startedAt: "14:55", remainingMinutes: 41, paidAmount: 40000, paymentStatus: "paid", orderItems: ["Chips"] },
  { id: "ps5-02", name: "PS5-02", type: "PS5 / Console", zone: "Console Zone", status: "free", deviceId: "B2-PS-002", ipAddress: "192.168.10.42", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "ps5-03", name: "PS5-03", type: "PS5 / Console", zone: "Console Zone", status: "locked", deviceId: "B2-PS-003", ipAddress: "192.168.10.43", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "xbox-01", name: "XBOX-01", type: "Xbox / Console", zone: "Console Zone", status: "offline", deviceId: "B2-XB-001", ipAddress: "192.168.10.51", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
  { id: "vip-01", name: "VIP-01", type: "VIP Room", zone: "VIP Zone", status: "busy", deviceId: "B2-VIP-001", ipAddress: "192.168.10.61", currentUser: "Dilshod", tariff: "VIP Room 1 hour", startedAt: "14:30", remainingMinutes: 58, paidAmount: 100000, paymentStatus: "paid", orderItems: ["Burger", "Water 0.5"] },
  { id: "vip-02", name: "VIP-02", type: "VIP Room", zone: "VIP Zone", status: "unpaid", deviceId: "B2-VIP-002", ipAddress: "192.168.10.62", currentUser: "Kamron", tariff: "VIP Room 1 hour", startedAt: "13:50", remainingMinutes: 0, paidAmount: 0, paymentStatus: "unpaid", orderItems: [] },
  { id: "vip-03", name: "VIP-03", type: "VIP Room", zone: "VIP Zone", status: "free", deviceId: "B2-VIP-003", ipAddress: "192.168.10.63", remainingMinutes: 0, paidAmount: 0, paymentStatus: "paid", orderItems: [] },
];

export const products: Product[] = [
  { id: "p1", name: "Coca-Cola 0.5", price: 9000, stock: 72, category: "Ichimliklar", icon: "🥤" },
  { id: "p2", name: "Water 0.5", price: 5000, stock: 90, category: "Ichimliklar", icon: "💧" },
  { id: "p3", name: "Burger", price: 25000, stock: 18, category: "Fast food", icon: "🍔" },
  { id: "p4", name: "Energy Drink", price: 15000, stock: 44, category: "Energy drink", icon: "⚡" },
  { id: "p5", name: "Chips", price: 12000, stock: 31, category: "Snack", icon: "▣" },
  { id: "p6", name: "Racing 60 min", price: 50000, stock: 999, category: "Paketlar", icon: "🏁" },
  { id: "p7", name: "Racing 2+1 Paket", price: 100000, stock: 999, category: "Paketlar", icon: "🎮" },
  { id: "p8", name: "VR 30 min", price: 45000, stock: 999, category: "Paketlar", icon: "◉" },
  { id: "p9", name: "VIP Room 1 hour", price: 100000, stock: 999, category: "Paketlar", icon: "◆" },
];

export const bookings: Booking[] = [
  { id: "b1", customerName: "Bekzod", phone: "998901234567", simulatorType: "Racing", simulatorId: "race-04", date: "2026-06-01", startTime: "16:00", endTime: "17:00", tariff: "Racing 60 min", prepayment: 20000, note: "Two players", status: "Confirmed" },
  { id: "b2", customerName: "Nilufar", phone: "998939998877", simulatorType: "VIP Room", simulatorId: "vip-03", date: "2026-06-01", startTime: "18:30", endTime: "20:00", tariff: "VIP Room 1 hour", prepayment: 50000, note: "Birthday setup", status: "Pending" },
];

export const customers = [
  { name: "Aziz", phone: "998901112233", balance: 120000, bonus: 7000, lastVisit: "2026-06-01", totalSpent: 2350000, sessions: 38, status: "Active" },
  { name: "Madina", phone: "998935557788", balance: 45000, bonus: 3000, lastVisit: "2026-06-01", totalSpent: 840000, sessions: 13, status: "Active" },
  { name: "Kamron", phone: "998977771111", balance: 0, bonus: 0, lastVisit: "2026-05-29", totalSpent: 320000, sessions: 6, status: "Debt" },
];

export const initialLogs: LogEntry[] = [
  { id: "l1", time: "15:03", operator: "admin", action: "started session on RACE-01", simulator: "RACE-01" },
  { id: "l2", time: "15:11", operator: "test_kassir", action: "received 50 000 by card", simulator: "RACE-02", paymentMethod: "Karta" },
  { id: "l3", time: "15:18", operator: "technician", action: "moved RACE-05 to maintenance", simulator: "RACE-05" },
];

export const supportMessages = [
  { from: "Support", text: "Assalomu alaykum, B2 Game Club support online.", time: "14:01", own: false },
  { from: "Operator", text: "VR-01 controller battery warning chiqyapti.", time: "14:03", own: true },
  { from: "Support Bot", text: "Ticket #B2-204 created and assigned to technician.", time: "14:04", own: false },
];
