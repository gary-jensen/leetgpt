/*
  Warnings:

  - You are about to drop the column `completedLessons` on the `UserProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "completedLessons",
ADD COLUMN     "lessonProgress" JSONB NOT NULL DEFAULT '{}';
