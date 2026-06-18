import { Request } from "express";
import { baseRole } from "../types/auth.types";

// Dashboard/hisobotlar uchun ko'rinish doirasi.
// admin  -> faqat o'z filiali VA o'zi bajargan amallar (actor = user_id).
// super_admin -> tanlangan filial (yoki barchasi), actor=null (admin bo'yicha cheklamaydi).
export function actorScope(req: Request): { branch: string | null; actor: string | null } {
  if (baseRole(req.user?.role) === "admin") {
    return { branch: req.user?.branch_id ?? null, actor: req.user?.user_id ?? null };
  }
  const q = req.query.branch_id;
  return { branch: !q || q === "all" ? null : String(q), actor: null };
}
