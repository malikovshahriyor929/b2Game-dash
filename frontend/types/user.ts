export type Role = "admin" | "super_admin";

export type Branch = {
  id: string;
  name: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchIds: string[];
  password: string;
};
