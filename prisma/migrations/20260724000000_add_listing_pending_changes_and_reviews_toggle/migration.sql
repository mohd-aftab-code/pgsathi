-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "hasPendingChanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewsEnabled" BOOLEAN NOT NULL DEFAULT true;
