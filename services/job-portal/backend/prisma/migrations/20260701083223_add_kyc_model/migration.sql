/*
  Warnings:

  - You are about to drop the `Logo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[logoId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GST_CERTIFICATE', 'COMPANY_PAN', 'INCORPORATION_CERTIFICATE', 'AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE');

-- DropForeignKey
ALTER TABLE "Logo" DROP CONSTRAINT "Logo_companyId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logoId" TEXT;

-- DropTable
DROP TABLE "Logo";

-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "companyDocumentId" TEXT NOT NULL,
    "companyDocumentType" "DocumentType" NOT NULL,
    "personalDocumentId" TEXT NOT NULL,
    "personalDocumentType" "DocumentType" NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KYC_userId_idx" ON "KYC"("userId");

-- CreateIndex
CREATE INDEX "KYC_companyId_idx" ON "KYC"("companyId");

-- CreateIndex
CREATE INDEX "KYC_status_idx" ON "KYC"("status");

-- CreateIndex
CREATE INDEX "KYC_userId_isLatest_idx" ON "KYC"("userId", "isLatest");

-- CreateIndex
CREATE INDEX "KYC_companyDocumentId_idx" ON "KYC"("companyDocumentId");

-- CreateIndex
CREATE INDEX "KYC_personalDocumentId_idx" ON "KYC"("personalDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_logoId_key" ON "Company"("logoId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "StorageAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_companyDocumentId_fkey" FOREIGN KEY ("companyDocumentId") REFERENCES "StorageAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_personalDocumentId_fkey" FOREIGN KEY ("personalDocumentId") REFERENCES "StorageAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
