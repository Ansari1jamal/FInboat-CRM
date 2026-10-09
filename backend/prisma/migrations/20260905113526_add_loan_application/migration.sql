-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'LOGIN', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanApplication" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "lenderId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "requestedAmount" DECIMAL(65,30),
    "sanctionedAmount" DECIMAL(65,30),
    "disbursedAmount" DECIMAL(65,30),
    "loginDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "disbursementDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lender_code_key" ON "Lender"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LoanApplication_applicationNumber_key" ON "LoanApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "LoanApplication_leadId_idx" ON "LoanApplication"("leadId");

-- CreateIndex
CREATE INDEX "LoanApplication_lenderId_idx" ON "LoanApplication"("lenderId");

-- CreateIndex
CREATE INDEX "LoanApplication_status_idx" ON "LoanApplication"("status");

-- CreateIndex
CREATE INDEX "LoanApplication_createdById_idx" ON "LoanApplication"("createdById");

-- CreateIndex
CREATE INDEX "LoanApplication_createdAt_idx" ON "LoanApplication"("createdAt");

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
