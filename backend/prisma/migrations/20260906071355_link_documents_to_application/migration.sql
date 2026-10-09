-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "applicationId" TEXT;

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
