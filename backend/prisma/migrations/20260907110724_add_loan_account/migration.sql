-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'CLOSED', 'FORECLOSED', 'WRITTEN_OFF');

-- CreateTable
CREATE TABLE "LoanAccount" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "lenderId" TEXT,
    "loanAccountNumber" TEXT NOT NULL,
    "principalAmount" DECIMAL(65,30) NOT NULL,
    "disbursedAmount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30),
    "tenureMonths" INTEGER,
    "emiAmount" DECIMAL(65,30),
    "disbursedAt" TIMESTAMP(3),
    "firstEmiDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoanAccount_applicationId_key" ON "LoanAccount"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanAccount_loanAccountNumber_key" ON "LoanAccount"("loanAccountNumber");

-- CreateIndex
CREATE INDEX "LoanAccount_leadId_idx" ON "LoanAccount"("leadId");

-- CreateIndex
CREATE INDEX "LoanAccount_lenderId_idx" ON "LoanAccount"("lenderId");

-- CreateIndex
CREATE INDEX "LoanAccount_status_idx" ON "LoanAccount"("status");

-- CreateIndex
CREATE INDEX "LoanAccount_disbursedAt_idx" ON "LoanAccount"("disbursedAt");

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
