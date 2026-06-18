-- DropColumn: customers.bonus was never read or written by the app (dead column).
ALTER TABLE "customers" DROP COLUMN IF EXISTS "bonus";
