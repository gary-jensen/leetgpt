/*
  Warnings:

  - You are about to drop the `CodeSubmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CodeSubmission" DROP CONSTRAINT "CodeSubmission_userId_fkey";

-- DropTable
DROP TABLE "public"."CodeSubmission";
