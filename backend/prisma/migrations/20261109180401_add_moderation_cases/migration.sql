/*
  Warnings:

  - You are about to drop the column `appellantId` on the `ModerationAppeal` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `ModerationAppeal` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `ModerationAppeal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ModerationAppeal` table. All the data in the column will be lost.
  - Added the required column `caseId` to the `ModerationAppeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filedBy` to the `ModerationAppeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statement` to the `ModerationAppeal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ModerationAppeal" DROP CONSTRAINT "ModerationAppeal_appellantId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationAppeal" DROP CONSTRAINT "ModerationAppeal_reportId_fkey";

-- DropIndex
DROP INDEX "ModerationAppeal_appellantId_idx";

-- DropIndex
DROP INDEX "ModerationAppeal_reportId_idx";

-- AlterTable
ALTER TABLE "ModerationAppeal" DROP COLUMN "appellantId",
DROP COLUMN "reason",
DROP COLUMN "reportId",
DROP COLUMN "updatedAt",
ADD COLUMN     "caseId" TEXT NOT NULL,
ADD COLUMN     "filedBy" TEXT NOT NULL,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "statement" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "ModerationCase" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModerationCase_reportId_key" ON "ModerationCase"("reportId");

-- CreateIndex
CREATE INDEX "ModerationAction_caseId_createdAt_idx" ON "ModerationAction"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationAction_moderatorId_createdAt_idx" ON "ModerationAction"("moderatorId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationAppeal_caseId_idx" ON "ModerationAppeal"("caseId");

-- CreateIndex
CREATE INDEX "ModerationAppeal_filedBy_idx" ON "ModerationAppeal"("filedBy");

-- AddForeignKey
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ModerationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_filedBy_fkey" FOREIGN KEY ("filedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SafetyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ModerationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
