-- CreateTable
CREATE TABLE "AlgoProblem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statementMd" TEXT NOT NULL,
    "statementHtml" TEXT,
    "topics" TEXT[],
    "difficulty" TEXT NOT NULL,
    "languages" TEXT[],
    "rubric" JSONB NOT NULL,
    "parameterNames" TEXT[],
    "tests" JSONB NOT NULL,
    "startingCode" JSONB NOT NULL,
    "passingCode" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgoProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlgoLesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topics" TEXT[],
    "difficulty" TEXT NOT NULL,
    "readingMinutes" INTEGER NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgoLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlgoProblem_slug_key" ON "AlgoProblem"("slug");

-- CreateIndex
CREATE INDEX "AlgoProblem_difficulty_idx" ON "AlgoProblem"("difficulty");

-- CreateIndex
CREATE INDEX "AlgoProblem_slug_idx" ON "AlgoProblem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AlgoLesson_slug_key" ON "AlgoLesson"("slug");

-- CreateIndex
CREATE INDEX "AlgoLesson_difficulty_idx" ON "AlgoLesson"("difficulty");

-- CreateIndex
CREATE INDEX "AlgoLesson_slug_idx" ON "AlgoLesson"("slug");
