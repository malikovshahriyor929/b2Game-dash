-- Persistent cash expenses and admin penalty payments.
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "source_type" TEXT NOT NULL DEFAULT 'payment',
  ADD COLUMN IF NOT EXISTS "source_note" TEXT;

CREATE TABLE IF NOT EXISTS "expenses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "branch_id" UUID NOT NULL,
  "shift_id" UUID,
  "amount" DECIMAL(14,2) NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'cash',
  "source" TEXT NOT NULL,
  "note" TEXT,
  "spent_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "expenses_branch_id_idx" ON "expenses" ("branch_id");
CREATE INDEX IF NOT EXISTS "expenses_shift_id_idx" ON "expenses" ("shift_id");
CREATE INDEX IF NOT EXISTS "expenses_spent_by_idx" ON "expenses" ("spent_by");

CREATE TABLE IF NOT EXISTS "admin_penalty_payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "branch_id" UUID NOT NULL,
  "shift_id" UUID,
  "admin_id" UUID NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'cash',
  "cash_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "card_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "qr_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "received_amount" DECIMAL(14,2),
  "change_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "recorded_by" UUID NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "admin_penalty_payments_branch_id_idx" ON "admin_penalty_payments" ("branch_id");
CREATE INDEX IF NOT EXISTS "admin_penalty_payments_shift_id_idx" ON "admin_penalty_payments" ("shift_id");
CREATE INDEX IF NOT EXISTS "admin_penalty_payments_admin_id_idx" ON "admin_penalty_payments" ("admin_id");
