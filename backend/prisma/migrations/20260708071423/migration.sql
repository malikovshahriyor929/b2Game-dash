-- DropIndex
DROP INDEX "tariffs_branch_zone_active_idx";

-- AlterTable
ALTER TABLE "tariffs" ALTER COLUMN "available_days" DROP DEFAULT;
