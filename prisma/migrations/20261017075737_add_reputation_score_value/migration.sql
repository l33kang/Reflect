/*
  Warnings:

  - Added the required column `scoreValue` to the `ReputationEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReputationEvent" ADD COLUMN     "scoreValue" DOUBLE PRECISION NOT NULL;
