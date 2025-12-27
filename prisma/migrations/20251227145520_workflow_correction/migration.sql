/*
  Warnings:

  - You are about to drop the column `privateKey` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "privateKey",
DROP COLUMN "publicKey";
