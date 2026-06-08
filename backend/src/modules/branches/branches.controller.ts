import { createGenericController } from "../_shared/generic.controller";
import { branchesService } from "./branches.service";
export const branchesController = createGenericController(branchesService);
