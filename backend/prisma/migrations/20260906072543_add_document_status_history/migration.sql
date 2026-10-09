-- CreateTable
CREATE TABLE "DocumentStatusHistory" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fromStatus" "DocumentStatus",
    "toStatus" "DocumentStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentStatusHistory_documentId_idx" ON "DocumentStatusHistory"("documentId");

-- CreateIndex
CREATE INDEX "DocumentStatusHistory_changedById_idx" ON "DocumentStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "DocumentStatusHistory_createdAt_idx" ON "DocumentStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "DocumentStatusHistory" ADD CONSTRAINT "DocumentStatusHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentStatusHistory" ADD CONSTRAINT "DocumentStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
