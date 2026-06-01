export type SimulatorType = "Racing" | "VR" | "PS5 / Console" | "Xbox / Console" | "VIP Room";
export type SimulatorStatus = "free" | "busy" | "reserved" | "ending_soon" | "unpaid" | "offline" | "maintenance" | "locked" | "paused";
export type PaymentStatus = "paid" | "unpaid" | "partial";

export type Simulator = {
  id: string;
  name: string;
  type: SimulatorType;
  zone: string;
  status: SimulatorStatus;
  deviceId: string;
  ipAddress: string;
  currentUser?: string;
  phone?: string;
  tariff?: string;
  startedAt?: string;
  remainingMinutes: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  orderItems: string[];
};
