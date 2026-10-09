/*
  Warnings:

  - A unique constraint covering the columns `[userId,dedupeKey]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "dedupeKey" TEXT,
ADD COLUMN     "emiScheduleId" TEXT,
ADD COLUMN     "followUpId" TEXT,
ADD COLUMN     "loanAccountId" TEXT,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_loanAccountId_idx" ON "Notification"("loanAccountId");

-- CreateIndex
CREATE INDEX "Notification_emiScheduleId_idx" ON "Notification"("emiScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "LoanAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_emiScheduleId_fkey" FOREIGN KEY ("emiScheduleId") REFERENCES "EmiSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
