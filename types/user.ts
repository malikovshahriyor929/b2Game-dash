export type Role = "Admin" | "Cashier" | "Operator" | "Technician";

export type MockUser = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  password: string;
};
