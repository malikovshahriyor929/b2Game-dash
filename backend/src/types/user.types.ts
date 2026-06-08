import { Role } from "./auth.types";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  branch_id: string | null;
  is_active: boolean;
};
