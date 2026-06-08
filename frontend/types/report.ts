export type ReportMetric = {
  label: string;
  value: number;
  tone: "blue" | "green" | "orange" | "red" | "purple";
};

export type CashTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  source: string;
  operator: string;
  date: string;
  time: string;
  paymentMethod: string;
  branchId: string;
  shiftId?: string;
};

export type Shift = {
  id: string;
  operator: string;
  date: string;
  shiftType: "Kunduzgi (09:00 - 18:00)" | "Tungi (18:01 - 09:00)";
  status: "open" | "closed";
  openTime: string;
  closeTime?: string;
  startingCash: number;
  endingCash?: number;
  expectedCash?: number;
  actualCash?: number;
  discrepancy?: number;
  cardRevenue: number;
  qrRevenue: number;
  totalIncome: number;
  totalExpense: number;
  notes?: string;
};

