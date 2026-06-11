-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "tariff_name" TEXT,
ADD COLUMN     "prepayment" DECIMAL(14,2) NOT NULL DEFAULT 0;
