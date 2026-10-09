/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoanAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoanApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationStatusHistory" DROP CONSTRAINT "ApplicationStatusHistory_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionFollowUp" DROP CONSTRAINT "CollectionFollowUp_loanAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentStatusHistory" DROP CONSTRAINT "DocumentStatusHistory_documentId_fkey";

-- DropForeignKey
ALTER TABLE "EmiSchedule" DROP CONSTRAINT "EmiSchedule_loanAccountId_fkey";

-- DropForeignKey
ALTER TABLE "LoanAccount" DROP CONSTRAINT "LoanAccount_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "LoanAccount" DROP CONSTRAINT "LoanAccount_leadId_fkey";

-- DropForeignKey
ALTER TABLE "LoanAccount" DROP CONSTRAINT "LoanAccount_lenderId_fkey";

-- DropForeignKey
ALTER TABLE "LoanApplication" DROP CONSTRAINT "LoanApplication_createdById_fkey";

-- DropForeignKey
ALTER TABLE "LoanApplication" DROP CONSTRAINT "LoanApplication_leadId_fkey";

-- DropForeignKey
ALTER TABLE "LoanApplication" DROP CONSTRAINT "LoanApplication_lenderId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_loanAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Repayment" DROP CONSTRAINT "Repayment_loanAccountId_fkey";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "LoanAccount";

-- DropTable
DROP TABLE "LoanApplication";

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "applicationId" TEXT,
    "docType" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "filePath" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_applications" (
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

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_accounts" (
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

    CONSTRAINT "loan_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_leadId_idx" ON "documents"("leadId");

-- CreateIndex
CREATE INDEX "documents_applicationId_idx" ON "documents"("applicationId");

-- CreateIndex
CREATE INDEX "documents_docType_idx" ON "documents"("docType");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_uploadedById_idx" ON "documents"("uploadedById");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE INDEX "documents_applicationId_status_idx" ON "documents"("applicationId", "status");

-- CreateIndex
CREATE INDEX "documents_leadId_status_idx" ON "documents"("leadId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_applicationNumber_key" ON "loan_applications"("applicationNumber");

-- CreateIndex
CREATE INDEX "loan_applications_leadId_idx" ON "loan_applications"("leadId");

-- CreateIndex
CREATE INDEX "loan_applications_lenderId_idx" ON "loan_applications"("lenderId");

-- CreateIndex
CREATE INDEX "loan_applications_status_idx" ON "loan_applications"("status");

-- CreateIndex
CREATE INDEX "loan_applications_createdById_idx" ON "loan_applications"("createdById");

-- CreateIndex
CREATE INDEX "loan_applications_createdAt_idx" ON "loan_applications"("createdAt");

-- CreateIndex
CREATE INDEX "loan_applications_status_createdAt_idx" ON "loan_applications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "loan_applications_lenderId_status_idx" ON "loan_applications"("lenderId", "status");

-- CreateIndex
CREATE INDEX "loan_applications_leadId_status_idx" ON "loan_applications"("leadId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "loan_accounts_applicationId_key" ON "loan_accounts"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_accounts_loanAccountNumber_key" ON "loan_accounts"("loanAccountNumber");

-- CreateIndex
CREATE INDEX "loan_accounts_leadId_idx" ON "loan_accounts"("leadId");

-- CreateIndex
CREATE INDEX "loan_accounts_lenderId_idx" ON "loan_accounts"("lenderId");

-- CreateIndex
CREATE INDEX "loan_accounts_status_idx" ON "loan_accounts"("status");

-- CreateIndex
CREATE INDEX "loan_accounts_disbursedAt_idx" ON "loan_accounts"("disbursedAt");

-- CreateIndex
CREATE INDEX "loan_accounts_status_disbursedAt_idx" ON "loan_accounts"("status", "disbursedAt");

-- CreateIndex
CREATE INDEX "loan_accounts_lenderId_status_idx" ON "loan_accounts"("lenderId", "status");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx" ON "ApplicationStatusHistory"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_module_recordId_createdAt_idx" ON "AuditLog"("module", "recordId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_assignedToId_status_idx" ON "CollectionFollowUp"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_status_scheduledDate_idx" ON "CollectionFollowUp"("status", "scheduledDate");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_loanAccountId_scheduledDate_idx" ON "CollectionFollowUp"("loanAccountId", "scheduledDate");

-- CreateIndex
CREATE INDEX "DocumentStatusHistory_documentId_createdAt_idx" ON "DocumentStatusHistory"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "EmiSchedule_loanAccountId_dueDate_idx" ON "EmiSchedule"("loanAccountId", "dueDate");

-- CreateIndex
CREATE INDEX "EmiSchedule_status_dueDate_idx" ON "EmiSchedule"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Repayment_loanAccountId_paymentDate_idx" ON "Repayment"("loanAccountId", "paymentDate");

-- CreateIndex
CREATE INDEX "Repayment_receivedById_paymentDate_idx" ON "Repayment"("receivedById", "paymentDate");

-- CreateIndex
CREATE INDEX "follow_ups_status_followUpDate_idx" ON "follow_ups"("status", "followUpDate");

-- CreateIndex
CREATE INDEX "follow_ups_scheduledBy_status_idx" ON "follow_ups"("scheduledBy", "status");

-- CreateIndex
CREATE INDEX "lead_status_history_leadId_changedAt_idx" ON "lead_status_history"("leadId", "changedAt");

-- CreateIndex
CREATE INDEX "leads_assignedToId_status_idx" ON "leads"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "leads_assignedToId_createdAt_idx" ON "leads"("assignedToId", "createdAt");

-- CreateIndex
CREATE INDEX "leads_assignedTeamId_createdAt_idx" ON "leads"("assignedTeamId", "createdAt");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentStatusHistory" ADD CONSTRAINT "DocumentStatusHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmiSchedule" ADD CONSTRAINT "EmiSchedule_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_loanAccountId_fkey" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
