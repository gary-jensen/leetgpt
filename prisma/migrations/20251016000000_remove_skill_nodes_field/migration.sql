-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "skillNodes";

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "currentSkillNodeId" SET NOT NULL,
ALTER COLUMN "currentSkillNodeId" SET DEFAULT 'variables';

