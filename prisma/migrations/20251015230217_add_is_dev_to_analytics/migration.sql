-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN     "isDev" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_isDev_idx" ON "AnalyticsEvent"("isDev");
