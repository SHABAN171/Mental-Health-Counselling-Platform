-- CreateEnum
CREATE TYPE "CounselorApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REVOKED');

-- AlterTable: add new status column, backfill from the old boolean, then drop it
ALTER TABLE "CounselorProfile" ADD COLUMN "status" "CounselorApprovalStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "CounselorProfile" SET "status" = 'APPROVED' WHERE "approved" = true;

ALTER TABLE "CounselorProfile" DROP COLUMN "approved";

-- DropIndex / CreateIndex
DROP INDEX IF EXISTS "CounselorProfile_approved_idx";
CREATE INDEX "CounselorProfile_status_idx" ON "CounselorProfile"("status");
