import { createGenericController } from "../_shared/generic.controller";
import { usersService } from "./users.service";
export const usersController = createGenericController(usersService);
