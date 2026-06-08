import { asyncHandler } from "../../utils/asyncHandler";
import { created, ok } from "../../utils/apiResponse";

export function createGenericController(service: ReturnType<typeof import("./generic.service").createGenericService>) {
  return {
    list: asyncHandler(async (req, res) => ok(res, await service.list(req))),
    get: asyncHandler(async (req, res) => ok(res, await service.get(req, String(req.params.id)))),
    create: asyncHandler(async (req, res) => created(res, await service.create(req))),
    update: asyncHandler(async (req, res) => ok(res, await service.update(req, String(req.params.id)))),
    remove: asyncHandler(async (req, res) => ok(res, await service.remove(req, String(req.params.id)))),
  };
}
