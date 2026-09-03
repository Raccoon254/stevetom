-- CreateTable
CREATE TABLE "MonthlyJobRun" (
    "id" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "campaignId" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "detail" TEXT,
    "trigger" TEXT NOT NULL DEFAULT 'cron',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyJobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyJobRun_status_idx" ON "MonthlyJobRun"("status");

-- CreateIndex
CREATE INDEX "MonthlyJobRun_startedAt_idx" ON "MonthlyJobRun"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyJobRun_job_period_key" ON "MonthlyJobRun"("job", "period");

