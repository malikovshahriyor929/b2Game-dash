-- Har bir to'lovni aniq smenaga bog'lash uchun shift_id ustuni.
-- Eski yozuvlar uchun NULL (vaqt bo'yicha hisoblangan), yangi to'lovlar ochiq smena id si bilan yoziladi.
ALTER TABLE "payments" ADD COLUMN "shift_id" UUID;

-- Smena pulini shift_id bo'yicha tez yig'ish uchun indeks.
CREATE INDEX IF NOT EXISTS "payments_shift_id_idx" ON "payments" ("shift_id");
