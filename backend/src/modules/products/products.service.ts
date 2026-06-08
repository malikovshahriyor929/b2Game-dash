import { createGenericService } from "../_shared/generic.service";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
const baseService = createGenericService({ table: "products", entity: "product", writableColumns: ["name","category","barcode","price","cost","is_active"] });

export const productsService = {
  ...baseService,
  async create(req: Parameters<typeof baseService.create>[0]) {
    const branchId = req.user?.role === "admin" ? req.user.branch_id : req.body.branch_id;
    if (!branchId || branchId === "all") throw new ApiError(400, "branch_id is required to create product inventory");

    const existing = req.body.barcode
      ? (await prisma.$queryRawUnsafe<any[]>("select * from products where barcode=$1 limit 1", req.body.barcode))[0]
      : null;
    if (existing) {
      const inventory = (await prisma.$queryRawUnsafe<any[]>("select id from inventory where branch_id=$1::uuid and product_id=$2::uuid limit 1", branchId, existing.id))[0];
      if (inventory) throw new ApiError(409, "Product barcode already exists in this branch");
      const stock = Number(req.body.stock_quantity ?? req.body.stock ?? 0);
      await prisma.$executeRawUnsafe(
        "insert into inventory(branch_id,product_id,stock_quantity,low_stock_threshold) values($1::uuid,$2::uuid,$3,$4)",
        branchId,
        existing.id,
        stock,
        Number(req.body.low_stock_threshold ?? 5),
      );
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
    }
    return (await prisma.$queryRawUnsafe<any[]>(
      "select p.*, i.stock_quantity, i.branch_id from products p join inventory i on i.product_id=p.id where p.id=$1::uuid and i.branch_id=$2::uuid limit 1",
      product.id,
      branchId,
    ))[0] ?? product;
  },
};
