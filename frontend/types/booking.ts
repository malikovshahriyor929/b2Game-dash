export type Booking = {
  id: string;
  customerName: string;
  phone: string;
  simulatorType: string;
  simulatorId: string;
  simulatorName?: string;
  branchName?: string;
  date: string;
  startTime: string;
  endTime: string;
  startAt?: string; // ISO — to'qnashuv va auto no-show hisobi uchun
  endAt?: string; // ISO
  tariff: string;
  prepayment: number;
  note: string;
  status: "Pending" | "Confirmed" | "Arrived" | "Cancelled" | "No-show" | "Completed";
};
