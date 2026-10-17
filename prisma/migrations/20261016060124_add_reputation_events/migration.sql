-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('APPRECIATION', 'CONSTRUCTIVE', 'ENCOURAGEMENT', 'APOLOGY', 'GRATITUDE');

-- CreateEnum
CREATE TYPE "ReputationDimension" AS ENUM ('KINDNESS', 'RESPECT', 'RELIABILITY', 'ACCOUNTABILITY');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "dimension" "ReputationDimension",
ADD COLUMN     "type" "FeedbackType";

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dimension" "ReputationDimension" NOT NULL,
    "rawWeight" DOUBLE PRECISION NOT NULL,
    "senderTrustAtTime" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReputationEvent_feedbackId_key" ON "ReputationEvent"("feedbackId");

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
