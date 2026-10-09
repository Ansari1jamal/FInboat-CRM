-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'TL', 'TELECALLER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'INTERESTED', 'DOCUMENTS_PENDING', 'LOGIN', 'APPROVED', 'DISBURSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('CONNECTED', 'NOT_CONNECTED', 'BUSY', 'WRONG_NUMBER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'DONE', 'MISSED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'RECEIVED', 'VERIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "managerId" TEXT,
    "tlId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "tlId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "loanType" TEXT NOT NULL,
    "loanAmount" DECIMAL(15,2) NOT NULL,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "teamId" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "telecallerId" TEXT NOT NULL,
    "callStatus" "CallStatus" NOT NULL,
    "remarks" TEXT,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "scheduledBy" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL,
    "followUpTime" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_status_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "oldStatus" "LeadStatus",
    "newStatus" "LeadStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_transfers" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT NOT NULL,
    "transferredById" TEXT NOT NULL,
    "reason" TEXT,
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "targets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "targetLeads" INTEGER NOT NULL DEFAULT 0,
    "targetDisbursement" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_managerId_idx" ON "users"("managerId");

-- CreateIndex
CREATE INDEX "users_tlId_idx" ON "users"("tlId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "teams_managerId_idx" ON "teams"("managerId");

-- CreateIndex
CREATE INDEX "teams_tlId_idx" ON "teams"("tlId");

-- CreateIndex
CREATE INDEX "leads_mobile_idx" ON "leads"("mobile");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_assignedToId_idx" ON "leads"("assignedToId");

-- CreateIndex
CREATE INDEX "leads_teamId_idx" ON "leads"("teamId");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "call_logs_leadId_idx" ON "call_logs"("leadId");

-- CreateIndex
CREATE INDEX "call_logs_telecallerId_idx" ON "call_logs"("telecallerId");

-- CreateIndex
CREATE INDEX "call_logs_calledAt_idx" ON "call_logs"("calledAt");

-- CreateIndex
CREATE INDEX "follow_ups_leadId_idx" ON "follow_ups"("leadId");

-- CreateIndex
CREATE INDEX "follow_ups_scheduledBy_idx" ON "follow_ups"("scheduledBy");

-- CreateIndex
CREATE INDEX "follow_ups_followUpDate_idx" ON "follow_ups"("followUpDate");

-- CreateIndex
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");

-- CreateIndex
CREATE INDEX "lead_status_history_leadId_idx" ON "lead_status_history"("leadId");

-- CreateIndex
CREATE INDEX "lead_status_history_changedBy_idx" ON "lead_status_history"("changedBy");

-- CreateIndex
CREATE INDEX "lead_status_history_changedAt_idx" ON "lead_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "lead_transfers_leadId_idx" ON "lead_transfers"("leadId");

-- CreateIndex
CREATE INDEX "lead_transfers_fromUserId_idx" ON "lead_transfers"("fromUserId");

-- CreateIndex
CREATE INDEX "lead_transfers_toUserId_idx" ON "lead_transfers"("toUserId");

-- CreateIndex
CREATE INDEX "lead_transfers_transferredById_idx" ON "lead_transfers"("transferredById");

-- CreateIndex
CREATE INDEX "lead_transfers_transferredAt_idx" ON "lead_transfers"("transferredAt");

-- CreateIndex
CREATE INDEX "documents_leadId_idx" ON "documents"("leadId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "targets_period_idx" ON "targets"("period");

-- CreateIndex
CREATE UNIQUE INDEX "targets_userId_period_key" ON "targets"("userId", "period");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tlId_fkey" FOREIGN KEY ("tlId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tlId_fkey" FOREIGN KEY ("tlId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_telecallerId_fkey" FOREIGN KEY ("telecallerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_scheduledBy_fkey" FOREIGN KEY ("scheduledBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targets" ADD CONSTRAINT "targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
