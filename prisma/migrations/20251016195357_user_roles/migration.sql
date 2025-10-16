-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'PRO', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BASIC';
