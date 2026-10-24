-- CreateTable
CREATE TABLE "SafetyReportAction" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "previousStatus" "SafetyReportStatus" NOT NULL,
    "newStatus" "SafetyReportStatus" NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyReportAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SafetyReportAction_reportId_createdAt_idx" ON "SafetyReportAction"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyReportAction_moderatorId_createdAt_idx" ON "SafetyReportAction"("moderatorId", "createdAt");

-- AddForeignKey
ALTER TABLE "SafetyReportAction" ADD CONSTRAINT "SafetyReportAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SafetyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReportAction" ADD CONSTRAINT "SafetyReportAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
