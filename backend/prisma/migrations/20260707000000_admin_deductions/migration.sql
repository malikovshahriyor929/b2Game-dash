-- Admin salary deductions / fines. Used for cash taken by an admin for personal needs
-- and other super-admin reviewed deductions.
CREATE TABLE IF NOT EXISTS "admin_deductions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "branch_id" UUID NOT NULL,
  "shift_id" UUID,
  "admin_id" UUID NOT NULL,
  "expense_id" UUID,
  "type" TEXT NOT NULL DEFAULT 'salary_advance',
  "amount" DECIMAL(14,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "note" TEXT,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "admin_deductions_branch_id_idx" ON "admin_deductions" ("branch_id");
CREATE INDEX IF NOT EXISTS "admin_deductions_shift_id_idx" ON "admin_deductions" ("shift_id");
CREATE INDEX IF NOT EXISTS "admin_deductions_admin_id_idx" ON "admin_deductions" ("admin_id");
CREATE INDEX IF NOT EXISTS "admin_deductions_type_idx" ON "admin_deductions" ("type");
CREATE INDEX IF NOT EXISTS "admin_deductions_expense_id_idx" ON "admin_deductions" ("expense_id");
