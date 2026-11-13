-- CreateTable
CREATE TABLE "FeedbackResolution" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "resolvedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackResolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResolution_feedbackId_key" ON "FeedbackResolution"("feedbackId");

-- AddForeignKey
ALTER TABLE "FeedbackResolution" ADD CONSTRAINT "FeedbackResolution_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResolution" ADD CONSTRAINT "FeedbackResolution_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
