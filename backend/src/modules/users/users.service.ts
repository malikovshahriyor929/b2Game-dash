import { createGenericService } from "../_shared/generic.service";
export const usersService = createGenericService({ table: "users", entity: "user", writableColumns: ["name","email","password_hash","role","branch_id","is_active"] });
