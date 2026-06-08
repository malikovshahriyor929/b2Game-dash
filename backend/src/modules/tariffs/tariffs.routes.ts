import { crudRoutes } from "../_shared/crud.routes";
import { tariffsController } from "./tariffs.controller";
export const tariffsRoutes = crudRoutes(tariffsController);
