-- DropForeignKey
ALTER TABLE "targets" DROP CONSTRAINT "targets_userId_fkey";

-- AlterTable
ALTER TABLE "targets" ADD COLUMN     "teamId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "targets_teamId_idx" ON "targets"("teamId");

-- AddForeignKey
ALTER TABLE "targets" ADD CONSTRAINT "targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targets" ADD CONSTRAINT "targets_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
