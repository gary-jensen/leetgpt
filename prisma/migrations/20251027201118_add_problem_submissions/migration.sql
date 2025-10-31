-- CreateTable
CREATE TABLE "AlgoProblemSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "runtime" INTEGER,
    "testsPassed" INTEGER NOT NULL,
    "testsTotal" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlgoProblemSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlgoProblemSubmission_userId_problemId_idx" ON "AlgoProblemSubmission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "AlgoProblemSubmission_submittedAt_idx" ON "AlgoProblemSubmission"("submittedAt");

-- AddForeignKey
ALTER TABLE "AlgoProblemSubmission" ADD CONSTRAINT "AlgoProblemSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
