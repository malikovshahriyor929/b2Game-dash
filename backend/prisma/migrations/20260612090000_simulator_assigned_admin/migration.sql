-- AlterTable
ALTER TABLE "simulators" ADD COLUMN     "assigned_admin_id" UUID;

-- CreateIndex
CREATE INDEX "simulators_assigned_admin_id_idx" ON "simulators"("assigned_admin_id");
