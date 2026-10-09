-- CreateEnum
CREATE TYPE "CollectionFollowUpStatus" AS ENUM ('PENDING', 'CONTACTED', 'PROMISED', 'PAID', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CollectionFollowUpType" AS ENUM ('EMI_DUE', 'EMI_OVERDUE', 'PAYMENT_PROMISE', 'COLLECTION_CALL');

-- CreateTable
CREATE TABLE "CollectionFollowUp" (
    "id" TEXT NOT NULL,
    "loanAccountId" TEXT NOT NULL,
    "emiScheduleId" TEXT,
    "assignedToId" TEXT NOT NULL,
    "type" "CollectionFollowUpType" NOT NULL,
    "status" "CollectionFollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT,
    "notes" TEXT,
    "promisedAmount" DECIMAL(65,30),
    "promisedDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionFollowUp_loanAccountId_idx" ON "CollectionFollowUp"("loanAccountId");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_emiScheduleId_idx" ON "CollectionFollowUp"("emiScheduleId");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_assignedToId_idx" ON "CollectionFollowUp"("assignedToId");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_status_idx" ON "CollectionFollowUp"("status");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_scheduledDate_idx" ON "CollectionFollowUp"("scheduledDate");

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "LoanAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_emiScheduleId_fkey" FOREIGN KEY ("emiScheduleId") REFERENCES "EmiSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
