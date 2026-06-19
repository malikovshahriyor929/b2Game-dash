-- Mid-shift cash withdrawal (выемка/inkassatsiya) request + confirmation handshake.
-- Either the branch owner (super_admin) or the admin on shift can initiate a request to
-- take cash out of the register; the counterparty confirms. Only a confirmed request
-- reduces that admin's expected cash and shows up as an expense.
CREATE TABLE "cash_withdrawal_requests" (
  "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
  "branch_id"      UUID NOT NULL,
  "shift_id"       UUID,
  "admin_id"       UUID NOT NULL,
  "amount"         DECIMAL(14,2) NOT NULL,
  "initiated_by"   UUID NOT NULL,
  "initiator_role" TEXT NOT NULL,
  "status"         TEXT NOT NULL DEFAULT 'pending',
  "note"           TEXT,
  "confirmed_by"   UUID,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT now(),
  "resolved_at"    TIMESTAMP(3),
  CONSTRAINT "cash_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cash_withdrawal_requests_branch_id_idx" ON "cash_withdrawal_requests"("branch_id");
CREATE INDEX "cash_withdrawal_requests_shift_id_idx" ON "cash_withdrawal_requests"("shift_id");
CREATE INDEX "cash_withdrawal_requests_admin_id_idx" ON "cash_withdrawal_requests"("admin_id");
CREATE INDEX "cash_withdrawal_requests_status_idx" ON "cash_withdrawal_requests"("status");
