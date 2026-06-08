import { createGenericService } from "../_shared/generic.service";
export const branchesService = createGenericService({ table: "branches", entity: "branch", writableColumns: ["name","code","address","phone","status"] });
