-- CreateEnum
CREATE TYPE "EmiStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "RepaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'NACH', 'CHEQUE', 'ONLINE', 'OTHER');

-- CreateTable
CREATE TABLE "EmiSchedule" (
    "id" TEXT NOT NULL,
    "loanAccountId" TEXT NOT NULL,
    "emiNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalAmount" DECIMAL(65,30) NOT NULL,
    "interestAmount" DECIMAL(65,30) NOT NULL,
    "emiAmount" DECIMAL(65,30) NOT NULL,
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "outstandingAmount" DECIMAL(65,30) NOT NULL,
    "status" "EmiStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmiSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" TEXT NOT NULL,
    "loanAccountId" TEXT NOT NULL,
    "emiScheduleId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" "RepaymentMode" NOT NULL,
    "transactionId" TEXT,
    "referenceNumber" TEXT,
    "remarks" TEXT,
    "receivedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmiSchedule_loanAccountId_idx" ON "EmiSchedule"("loanAccountId");

-- CreateIndex
CREATE INDEX "EmiSchedule_dueDate_idx" ON "EmiSchedule"("dueDate");

-- CreateIndex
CREATE INDEX "EmiSchedule_status_idx" ON "EmiSchedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmiSchedule_loanAccountId_emiNumber_key" ON "EmiSchedule"("loanAccountId", "emiNumber");

-- CreateIndex
CREATE INDEX "Repayment_loanAccountId_idx" ON "Repayment"("loanAccountId");

-- CreateIndex
CREATE INDEX "Repayment_emiScheduleId_idx" ON "Repayment"("emiScheduleId");

-- CreateIndex
CREATE INDEX "Repayment_paymentDate_idx" ON "Repayment"("paymentDate");

-- CreateIndex
CREATE INDEX "Repayment_receivedById_idx" ON "Repayment"("receivedById");

-- AddForeignKey
ALTER TABLE "EmiSchedule" ADD CONSTRAINT "EmiSchedule_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "LoanAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "LoanAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_emiScheduleId_fkey" FOREIGN KEY ("emiScheduleId") REFERENCES "EmiSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
