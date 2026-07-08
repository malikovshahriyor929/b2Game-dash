ALTER TABLE "tariffs"
  ALTER COLUMN "available_from" TYPE TIME(0) USING "available_from"::time(0),
  ALTER COLUMN "available_until" TYPE TIME(0) USING "available_until"::time(0);
