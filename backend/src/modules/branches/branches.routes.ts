import { crudRoutes } from "../_shared/crud.routes";
import { branchesController } from "./branches.controller";
export const branchesRoutes = crudRoutes(branchesController);
