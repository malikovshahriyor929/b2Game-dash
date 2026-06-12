-- Har bir filialda bir vaqtning o'zida faqat bitta ochiq smena bo'lishini ta'minlaydi.
-- Ilova darajasidagi tekshiruv (TOCTOU) o'rniga DB darajasida kafolat beradi.
CREATE UNIQUE INDEX IF NOT EXISTS "shifts_one_open_per_branch"
  ON "shifts" ("branch_id")
  WHERE "status" = 'open';
