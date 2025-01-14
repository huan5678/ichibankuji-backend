/*
  Warnings:

  - You are about to drop the `DrawRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DrawSetPrize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DrawSet_Lock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DrawRecord" DROP CONSTRAINT "DrawRecord_drawSetId_fkey";

-- DropForeignKey
ALTER TABLE "DrawRecord" DROP CONSTRAINT "DrawRecord_prizeId_fkey";

-- DropForeignKey
ALTER TABLE "DrawRecord" DROP CONSTRAINT "DrawRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "DrawSetPrize" DROP CONSTRAINT "DrawSetPrize_drawSetId_fkey";

-- DropForeignKey
ALTER TABLE "DrawSetPrize" DROP CONSTRAINT "DrawSetPrize_prizeId_fkey";

-- DropForeignKey
ALTER TABLE "DrawSet_Lock" DROP CONSTRAINT "DrawSet_Lock_drawSetId_fkey";

-- DropTable
DROP TABLE "DrawRecord";

-- DropTable
DROP TABLE "DrawSetPrize";

-- DropTable
DROP TABLE "DrawSet_Lock";

-- CreateTable
CREATE TABLE "draw_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "prizeId" UUID NOT NULL,
    "drawNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_set_prizes" (
    "id" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "prizeId" UUID NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_set_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_set_locks" (
    "id" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_set_locks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "draw_records_userId_idx" ON "draw_records"("userId");

-- CreateIndex
CREATE INDEX "draw_records_drawSetId_idx" ON "draw_records"("drawSetId");

-- CreateIndex
CREATE INDEX "draw_records_prizeId_idx" ON "draw_records"("prizeId");

-- CreateIndex
CREATE INDEX "draw_set_prizes_drawSetId_idx" ON "draw_set_prizes"("drawSetId");

-- CreateIndex
CREATE INDEX "draw_set_prizes_prizeId_idx" ON "draw_set_prizes"("prizeId");

-- CreateIndex
CREATE INDEX "draw_set_locks_drawSetId_idx" ON "draw_set_locks"("drawSetId");

-- CreateIndex
CREATE INDEX "draw_set_locks_userId_idx" ON "draw_set_locks"("userId");

-- AddForeignKey
ALTER TABLE "draw_records" ADD CONSTRAINT "draw_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_records" ADD CONSTRAINT "draw_records_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_records" ADD CONSTRAINT "draw_records_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_set_prizes" ADD CONSTRAINT "draw_set_prizes_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_set_prizes" ADD CONSTRAINT "draw_set_prizes_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_set_locks" ADD CONSTRAINT "draw_set_locks_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
