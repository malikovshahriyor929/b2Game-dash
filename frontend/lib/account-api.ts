import { backendPost } from "@/server/api";

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

// Self-service password change for the logged-in user (admin, super_admin or dev).
export function changePassword(payload: ChangePasswordPayload) {
  return backendPost<{ changed: boolean }>("/auth/change-password", payload);
}
