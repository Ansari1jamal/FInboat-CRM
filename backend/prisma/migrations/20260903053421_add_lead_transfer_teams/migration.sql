-- AlterTable
ALTER TABLE "lead_transfers" ADD COLUMN     "fromTeamId" TEXT,
ADD COLUMN     "toTeamId" TEXT;

-- CreateIndex
CREATE INDEX "lead_transfers_fromTeamId_idx" ON "lead_transfers"("fromTeamId");

-- CreateIndex
CREATE INDEX "lead_transfers_toTeamId_idx" ON "lead_transfers"("toTeamId");

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_fromTeamId_fkey" FOREIGN KEY ("fromTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transfers" ADD CONSTRAINT "lead_transfers_toTeamId_fkey" FOREIGN KEY ("toTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
