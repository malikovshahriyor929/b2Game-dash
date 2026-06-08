import { createGenericService } from "../_shared/generic.service";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
const baseService = createGenericService({ table: "products", entity: "product", writableColumns: ["name","category","barcode","price","cost","icon","is_active"] });

export const productsService = {
  ...baseService,
  async create(req: Parameters<typeof baseService.create>[0]) {
    const branchId = req.user?.role === "admin" ? req.user.branch_id : req.body.branch_id;
    if (!branchId || branchId === "all") throw new ApiError(400, "branch_id is required to create product inventory");

    const existing = req.body.barcode
      ? (await prisma.$queryRawUnsafe<any[]>("select * from products where barcode=$1 limit 1", req.body.barcode))[0]
      : null;
    if (existing) {
      const stock = Number(req.body.stock_quantity ?? req.body.stock ?? 0);
      const before = (await prisma.$queryRawUnsafe<any[]>("select stock_quantity from inventory where branch_id=$1::uuid and product_id=$2::uuid limit 1", branchId, existing.id))[0];
      await prisma.$executeRawUnsafe(
        "update products set name=coalesce($1,name), category=coalesce($2,category), price=coalesce($3,price), cost=coalesce($4,cost), icon=coalesce($5,icon), is_active=coalesce($6,is_active), updated_at=now() where id=$7::uuid",
        req.body.name ?? null,
        req.body.category ?? null,
        req.body.price ?? null,
        req.body.cost ?? null,
        req.body.icon ?? null,
        req.body.is_active ?? true,
        existing.id,
      );
      await prisma.$executeRawUnsafe(
        "insert into inventory(branch_id,product_id,stock_quantity,low_stock_threshold) values($1::uuid,$2::uuid,$3,$4) on conflict(branch_id,product_id) do update set stock_quantity=excluded.stock_quantity, low_stock_threshold=excluded.low_stock_threshold, updated_at=now()",
        branchId,
        existing.id,
        stock,
        Number(req.body.low_stock_threshold ?? 5),
      );
      await auditLog({
        actor: req.user,
        branch_id: branchId,
        action_type: before ? "product_stock_updated" : "product_stock_added",
        entity_type: "product",
        entity_id: existing.id,
        details: { barcode: req.body.barcode, name: req.body.name ?? existing.name, category: req.body.category ?? existing.category, cost: Number(req.body.cost ?? existing.cost ?? 0), price: Number(req.body.price ?? existing.price ?? 0), icon: req.body.icon ?? existing.icon ?? "snack", stock_before: before ? Number(before.stock_quantity ?? 0) : null, stock_after: stock },
      });
      return (await prisma.$queryRawUnsafe<any[]>(
        "select p.*, i.stock_quantity, i.branch_id from products p join inventory i on i.product_id=p.id where p.id=$1::uuid and i.branch_id=$2::uuid limit 1",
        existing.id,
        branchId,
      ))[0];
    }

    const product = await baseService.create(req) as { id?: string };
    if (product.id && branchId) {
      const stock = Number(req.body.stock_quantity ?? req.body.stock ?? 0);
      await prisma.$executeRawUnsafe(
        "insert into inventory(branch_id,product_id,stock_quantity,low_stock_threshold) values($1::uuid,$2::uuid,$3,$4) on conflict(branch_id,product_id) do update set stock_quantity=$3, updated_at=now()",
        branchId,
        product.id,
        stock,
        Number(req.body.low_stock_threshold ?? 5),
      );
      await auditLog({
        actor: req.user,
        branch_id: branchId,
        action_type: "product_inventory_created",
        entity_type: "product",
        entity_id: product.id,
        details: { barcode: req.body.barcode, name: req.body.name, category: req.body.category, cost: Number(req.body.cost ?? 0), price: Number(req.body.price ?? 0), icon: req.body.icon ?? "snack", stock_after: stock },
      });
    }
    return (await prisma.$queryRawUnsafe<any[]>(
      "select p.*, i.stock_quantity, i.branch_id from products p join inventory i on i.product_id=p.id where p.id=$1::uuid and i.branch_id=$2::uuid limit 1",
      product.id,
      branchId,
    ))[0] ?? product;
  },
};
