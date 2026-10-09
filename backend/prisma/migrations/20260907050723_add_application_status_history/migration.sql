-- CreateTable
CREATE TABLE "ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_idx" ON "ApplicationStatusHistory"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_changedById_idx" ON "ApplicationStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_toStatus_idx" ON "ApplicationStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_createdAt_idx" ON "ApplicationStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
