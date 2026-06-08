import { PoolClient } from "pg";

export async function updateOpenShiftTotals(client: PoolClient, branchId: string, method: string, amount: number, source: "session" | "product") {
  await client.query(
    `update shifts set
      card_total = card_total + case when $2='card' then $3 else 0 end,
      qr_total = qr_total + case when $2='qr' then $3 else 0 end,
      expected_cash = expected_cash + case when $2='cash' then $3 else 0 end,
      session_sales = session_sales + case when $4='session' then $3 else 0 end,
      product_sales = product_sales + case when $4='product' then $3 else 0 end
     where branch_id=$1 and status='open'`,
    [branchId, method, amount, source],
  );
}
