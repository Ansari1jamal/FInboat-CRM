/*
  Warnings:

  - You are about to drop the column `teamId` on the `leads` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_teamId_fkey";

-- DropIndex
DROP INDEX "leads_teamId_idx";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "teamId",
ADD COLUMN     "assignedTeamId" TEXT;

-- CreateIndex
CREATE INDEX "leads_assignedTeamId_idx" ON "leads"("assignedTeamId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
