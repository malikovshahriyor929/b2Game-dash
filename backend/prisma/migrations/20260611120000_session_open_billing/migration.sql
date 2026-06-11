-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "billing_mode" TEXT NOT NULL DEFAULT 'fixed',
ADD COLUMN     "hourly_rate" DECIMAL(14,2) NOT NULL DEFAULT 0;
