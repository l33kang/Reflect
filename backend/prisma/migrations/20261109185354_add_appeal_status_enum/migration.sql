/*
  Warnings:

  - The `status` column on the `ModerationAppeal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('OPEN', 'UPHELD', 'OVERTURNED');

-- AlterTable
ALTER TABLE "ModerationAppeal" DROP COLUMN "status",
ADD COLUMN     "status" "AppealStatus" NOT NULL DEFAULT 'OPEN';
