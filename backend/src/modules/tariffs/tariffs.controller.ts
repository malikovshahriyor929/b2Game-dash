import { createGenericController } from "../_shared/generic.controller";
import { tariffsService } from "./tariffs.service";
export const tariffsController = createGenericController(tariffsService);
