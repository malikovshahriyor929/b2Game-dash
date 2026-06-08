import { crudRoutes } from "../_shared/crud.routes";
import { usersController } from "./users.controller";
export const usersRoutes = crudRoutes(usersController);
