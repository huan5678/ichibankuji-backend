/*
  Warnings:

  - A unique constraint covering the columns `[drawSetId,number]` on the table `draw_set_prizes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `draw_set_prizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `draw_set_prizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remaining` to the `draw_set_prizes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "draw_set_prizes" ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "remaining" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "draw_set_prizes_drawSetId_number_key" ON "draw_set_prizes"("drawSetId", "number");
