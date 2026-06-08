import { Router } from "express";

export function crudRoutes(controller: ReturnType<typeof import("./generic.controller").createGenericController>) {
  const router = Router();
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.get);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
}
