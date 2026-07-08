-- Cash withdrawal requests can be owner collection, admin personal debt, or an expense.
ALTER TABLE "cash_withdrawal_requests"
  ADD COLUMN IF NOT EXISTS "purpose" TEXT NOT NULL DEFAULT 'owner_withdrawal',
  ADD COLUMN IF NOT EXISTS "deduction_type" TEXT,
  ADD COLUMN IF NOT EXISTS "expense_id" UUID;

CREATE INDEX IF NOT EXISTS "cash_withdrawal_requests_purpose_idx" ON "cash_withdrawal_requests"("purpose");
CREATE INDEX IF NOT EXISTS "cash_withdrawal_requests_expense_id_idx" ON "cash_withdrawal_requests"("expense_id");
