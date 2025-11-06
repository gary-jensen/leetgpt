/*
  Warnings:

  - You are about to drop the column `parameterNames` on the `AlgoProblem` table. All the data in the column will be lost.
  - You are about to drop the column `systemCode` on the `AlgoProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlgoProblem" DROP COLUMN "parameterNames",
DROP COLUMN "systemCode";
