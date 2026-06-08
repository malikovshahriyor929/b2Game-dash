import { createGenericService } from "../_shared/generic.service";
export const tariffsService = createGenericService({ table: "tariffs", entity: "tariff", branchScoped: true, writableColumns: ["branch_id","name","simulator_zone","duration_minutes","price","type","is_active"] });
