/*
  Warnings:

  - You are about to alter the column `pendingPayouts` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "pendingPayouts" SET DEFAULT 0,
ALTER COLUMN "pendingPayouts" SET DATA TYPE INTEGER;
