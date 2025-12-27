/*
  Warnings:

  - You are about to drop the column `keypair` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `privateKey` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "keypair",
ADD COLUMN     "privateKey" TEXT NOT NULL;
