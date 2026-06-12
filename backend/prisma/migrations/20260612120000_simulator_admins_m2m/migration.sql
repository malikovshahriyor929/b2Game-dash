-- CreateTable: many-to-many simulator <-> admin
CREATE TABLE "simulator_admins" (
    "simulator_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "simulator_admins_pkey" PRIMARY KEY ("simulator_id","admin_id")
);

-- CreateIndex
CREATE INDEX "simulator_admins_admin_id_idx" ON "simulator_admins"("admin_id");

-- Migrate existing single assignments into the junction table
INSERT INTO "simulator_admins"("simulator_id","admin_id")
  SELECT id, assigned_admin_id FROM "simulators" WHERE assigned_admin_id IS NOT NULL
  ON CONFLICT DO NOTHING;

-- Drop the old single-assignment column
DROP INDEX IF EXISTS "simulators_assigned_admin_id_idx";
ALTER TABLE "simulators" DROP COLUMN "assigned_admin_id";
