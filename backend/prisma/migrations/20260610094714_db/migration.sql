/*
  Warnings:

  - You are about to alter the column `received_amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.
  - You are about to alter the column `change_amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.
  - You are about to alter the column `icon` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to drop the column `map_position` on the `simulators` table. All the data in the column will be lost.
  - You are about to alter the column `weekday_price` on the `tariffs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.
  - You are about to alter the column `weekend_price` on the `tariffs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "received_amount" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "change_amount" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "icon" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "simulators" DROP COLUMN "map_position";

-- AlterTable
ALTER TABLE "tariffs" ALTER COLUMN "weekday_price" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "weekend_price" SET DATA TYPE DECIMAL(14,2);
