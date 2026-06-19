-- Maintenance accountability: admin opens/closes maintenance, super admin reviews and charges.
ALTER TABLE "repair_requests"
  ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "duration_minutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "charge_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "review_status" TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS "reviewed_by" UUID,
  ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMPTZ;

-- Backfill existing rows to a terminal review state so the new flow ignores them.
UPDATE "repair_requests" SET "review_status" = 'cleared' WHERE "review_status" = 'open' AND "status" IN ('confirmed_fixed', 'rejected');

CREATE INDEX IF NOT EXISTS "repair_requests_review_status_idx" ON "repair_requests" ("review_status");
CREATE INDEX IF NOT EXISTS "repair_requests_requested_by_idx" ON "repair_requests" ("requested_by");
