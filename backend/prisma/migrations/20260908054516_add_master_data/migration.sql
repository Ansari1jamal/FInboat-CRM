-- CreateTable
CREATE TABLE "MasterData" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MasterData_category_idx" ON "MasterData"("category");

-- CreateIndex
CREATE INDEX "MasterData_category_isActive_idx" ON "MasterData"("category", "isActive");

-- CreateIndex
CREATE INDEX "MasterData_sortOrder_idx" ON "MasterData"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MasterData_category_code_key" ON "MasterData"("category", "code");
