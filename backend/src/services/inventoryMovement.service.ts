import { PoolClient } from "pg";

export async function createInventoryMovement(client: PoolClient, input: {
  branchId: string;
  productId: string;
  type: "sale" | "restock" | "adjustment" | "refund";
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason?: string;
  userId: string;
}) {
  await client.query(
    `insert into inventory_movements(branch_id, product_id, type, quantity, before_quantity, after_quantity, reason, created_by)
     values($1,$2,$3,$4,$5,$6,$7,$8)`,
    [input.branchId, input.productId, input.type, input.quantity, input.beforeQuantity, input.afterQuantity, input.reason ?? null, input.userId],
  );
}
