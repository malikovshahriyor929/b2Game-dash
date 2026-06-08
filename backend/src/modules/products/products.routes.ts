import { crudRoutes } from "../_shared/crud.routes";
import { productsController } from "./products.controller";
export const productsRoutes = crudRoutes(productsController);
