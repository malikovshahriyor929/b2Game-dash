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
  tariff: string;
  prepayment: number;
  note: string;
  status: "Pending" | "Confirmed" | "Arrived" | "Cancelled" | "No-show" | "Completed";
};
