import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";

// Filialdagi ochiq smena id sini qaytaradi.
// Ochiq smena bo'lmasa to'lovni rad etadi — to'lov faqat smena ichida bo'lishi shart.
export async function requireOpenShift(branch: string): Promise<string> {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    "select id from shifts where branch_id=$1::uuid and status='open' limit 1",
    branch,
  );
  if (!rows.length) throw new ApiError(409, "No open shift for this branch");
  return rows[0].id;
}
