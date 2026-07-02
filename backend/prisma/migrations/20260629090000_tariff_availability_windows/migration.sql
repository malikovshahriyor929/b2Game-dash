ALTER TABLE "tariffs"
  ADD COLUMN IF NOT EXISTS "available_days" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  ADD COLUMN IF NOT EXISTS "available_from" TIME,
  ADD COLUMN IF NOT EXISTS "available_until" TIME,
  ADD COLUMN IF NOT EXISTS "availability_label" TEXT;

CREATE INDEX IF NOT EXISTS "tariffs_branch_zone_active_idx"
  ON "tariffs"("branch_id", "simulator_zone", "is_active");
