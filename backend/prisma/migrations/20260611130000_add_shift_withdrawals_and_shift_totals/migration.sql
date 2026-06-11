-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "balance_sales" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "bank_withdrawn" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "card_withdrawn" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "cash_sales" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "cash_withdrawn" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "remaining_cash" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "shift_type" TEXT,
ADD COLUMN     "total_revenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "withdraw_recipient" TEXT;

-- CreateTable
CREATE TABLE "shift_withdrawals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shift_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "recipient" TEXT,
    "note" TEXT,
    "withdrawn_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shift_withdrawals_shift_id_idx" ON "shift_withdrawals"("shift_id");

-- CreateIndex
CREATE INDEX "shift_withdrawals_branch_id_idx" ON "shift_withdrawals"("branch_id");
