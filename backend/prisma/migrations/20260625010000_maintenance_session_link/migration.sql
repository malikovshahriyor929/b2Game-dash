-- Link maintenance opened during active gameplay to the interrupted session.
ALTER TABLE "repair_requests"
  ADD COLUMN IF NOT EXISTS "session_id" UUID,
  ADD COLUMN IF NOT EXISTS "opened_during_session" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "repair_requests_session_id_idx" ON "repair_requests" ("session_id");
