-- DropIndex
DROP INDEX "repair_requests_requested_by_idx";

-- DropIndex
DROP INDEX "repair_requests_review_status_idx";

-- AlterTable
ALTER TABLE "repair_requests" ALTER COLUMN "closed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reviewed_at" SET DATA TYPE TIMESTAMP(3);
