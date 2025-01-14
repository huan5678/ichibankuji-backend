-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'LAST');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "password" TEXT NOT NULL,
    "picture" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_sets" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(250),
    "image" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxDraws" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "prizeId" UUID NOT NULL,
    "drawNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawSetPrize" (
    "id" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "prizeId" UUID NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawSetPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawSet_Lock" (
    "id" UUID NOT NULL,
    "drawSetId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawSet_Lock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DrawRecord_userId_idx" ON "DrawRecord"("userId");

-- CreateIndex
CREATE INDEX "DrawRecord_drawSetId_idx" ON "DrawRecord"("drawSetId");

-- CreateIndex
CREATE INDEX "DrawRecord_prizeId_idx" ON "DrawRecord"("prizeId");

-- CreateIndex
CREATE INDEX "DrawSetPrize_drawSetId_idx" ON "DrawSetPrize"("drawSetId");

-- CreateIndex
CREATE INDEX "DrawSetPrize_prizeId_idx" ON "DrawSetPrize"("prizeId");

-- CreateIndex
CREATE INDEX "DrawSet_Lock_drawSetId_idx" ON "DrawSet_Lock"("drawSetId");

-- CreateIndex
CREATE INDEX "DrawSet_Lock_userId_idx" ON "DrawSet_Lock"("userId");

-- AddForeignKey
ALTER TABLE "DrawRecord" ADD CONSTRAINT "DrawRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawRecord" ADD CONSTRAINT "DrawRecord_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawRecord" ADD CONSTRAINT "DrawRecord_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSetPrize" ADD CONSTRAINT "DrawSetPrize_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSetPrize" ADD CONSTRAINT "DrawSetPrize_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSet_Lock" ADD CONSTRAINT "DrawSet_Lock_drawSetId_fkey" FOREIGN KEY ("drawSetId") REFERENCES "draw_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
