-- CreateTable
CREATE TABLE "AlgoProblemFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "problemId" TEXT NOT NULL,
    "issues" TEXT[],
    "additionalFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlgoProblemFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlgoProblemFeedback_problemId_idx" ON "AlgoProblemFeedback"("problemId");

-- CreateIndex
CREATE INDEX "AlgoProblemFeedback_createdAt_idx" ON "AlgoProblemFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "AlgoProblemFeedback" ADD CONSTRAINT "AlgoProblemFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
