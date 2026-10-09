/*
  Warnings:

  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR', 'PAN', 'BANK_STATEMENT', 'SALARY_SLIP', 'PHOTO', 'ADDRESS_PROOF', 'INCOME_PROOF', 'OTHER');

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_leadId_fkey";

-- DropTable
DROP TABLE "documents";

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
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

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_leadId_idx" ON "Document"("leadId");

-- CreateIndex
CREATE INDEX "Document_docType_idx" ON "Document"("docType");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
