// Hidden developer roles mirror their base role but stay invisible to regular clients:
//   dev_admin       -> admin       (branch-scoped)
//   dev_super_admin -> super_admin (global)
export type Role = "admin" | "super_admin" | "dev_admin" | "dev_super_admin";

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
