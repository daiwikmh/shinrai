/*
  Warnings:

  - Added the required column `address` to the `Workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keypair` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "keypair" TEXT NOT NULL;
