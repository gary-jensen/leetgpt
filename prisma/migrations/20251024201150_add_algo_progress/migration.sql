-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PRO';

-- CreateTable
CREATE TABLE "AlgoProblemProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentCode" TEXT NOT NULL,
    "chatHistory" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgoProblemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlgoLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgoLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlgoProblemProgress_userId_problemId_language_key" ON "AlgoProblemProgress"("userId", "problemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "AlgoLessonProgress_userId_lessonId_key" ON "AlgoLessonProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "AlgoProblemProgress" ADD CONSTRAINT "AlgoProblemProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlgoLessonProgress" ADD CONSTRAINT "AlgoLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
