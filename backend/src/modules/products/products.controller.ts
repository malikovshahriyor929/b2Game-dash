import { createGenericController } from "../_shared/generic.controller";
import { productsService } from "./products.service";
export const productsController = createGenericController(productsService);
