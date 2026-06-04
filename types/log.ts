export type LogEntry = {
  id: string;
  time: string;
  operator: string;
  action: string;
  simulator?: string;
  paymentMethod?: string;
};

export type LockUnlockEntry = {
  id: string;
  time: string;
  date: string;
  operator: string;
  simulator: string;
  action: "lock" | "unlock";
};

