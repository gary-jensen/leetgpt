-- AlterTable
ALTER TABLE "AlgoProblem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "AlgoProblem_order_idx" ON "AlgoProblem"("order");
