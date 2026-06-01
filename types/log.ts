export type LogEntry = {
  id: string;
  time: string;
  operator: string;
  action: string;
  simulator?: string;
  paymentMethod?: string;
};
