/*
  Warnings:

  - You are about to drop the column `reviewedById` on the `KYC` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'HR');

-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('JOB', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXPERT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('ANY', 'MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "EnglishFluency" AS ENUM ('NONE', 'BASIC', 'INTERMEDIATE', 'FLUENT');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('WORK_FROM_OFFICE', 'REMOTE', 'HYBRID', 'TEMPORARY_WFH');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('STARTUP', 'MNC', 'FOREIGN_MNC', 'INDIAN_MNC', 'CORPORATE', 'GOVT_PSU', 'OTHERS');

-- CreateEnum
CREATE TYPE "RoleCategory" AS ENUM ('SOFTWARE_DEVELOPMENT', 'DATA_SCIENCE', 'DEVOPS', 'CYBERSECURITY', 'IT_SUPPORT', 'QA_TESTING', 'HARDWARE', 'UI_UX', 'GRAPHIC_DESIGN', 'PRODUCT_DESIGN', 'PRODUCT_MANAGEMENT', 'PROJECT_MANAGEMENT', 'BUSINESS_ANALYSIS', 'OPERATIONS', 'CONSULTING', 'SALES', 'DIGITAL_MARKETING', 'CONTENT', 'SEO_SEM', 'BRAND_MANAGEMENT', 'FINANCE', 'ACCOUNTING', 'LEGAL', 'COMPLIANCE', 'HUMAN_RESOURCES', 'RECRUITMENT', 'ADMINISTRATION', 'CUSTOMER_SUPPORT', 'RESEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('INFORMATION_TECHNOLOGY', 'SOFTWARE', 'ECOMMERCE', 'FINTECH', 'EDTECH', 'HEALTHTECH', 'BANKING', 'INSURANCE', 'HEALTHCARE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'REAL_ESTATE', 'LOGISTICS', 'AUTOMOTIVE', 'ENERGY', 'TELECOM', 'MEDIA', 'ENTERTAINMENT', 'HOSPITALITY', 'AGRICULTURE', 'GOVERNMENT', 'NONPROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'ANY');

-- CreateEnum
CREATE TYPE "StipendType" AS ENUM ('FIXED', 'PERFORMANCE_BASED', 'UNPAID');

-- CreateEnum
CREATE TYPE "StipendPeriod" AS ENUM ('MONTHLY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "SalaryPeriod" AS ENUM ('HOURLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('DISABLED', 'BETA', 'PUBLIC');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'MESSAGE', 'ALERT', 'PROMOTIONAL');

-- DropForeignKey
ALTER TABLE "KYC" DROP CONSTRAINT "KYC_reviewedById_fkey";

-- AlterTable
ALTER TABLE "KYC" DROP COLUMN "reviewedById";

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "type" "DraftType" NOT NULL,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "opportunityType" "DraftType" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "experienceLevel" "ExperienceLevel",
    "workMode" "WorkMode" NOT NULL,
    "companyType" "CompanyType" NOT NULL,
    "roleCategory" "RoleCategory" NOT NULL,
    "industry" "Industry" NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "minimumDegree" "DegreeLevel" NOT NULL DEFAULT 'ANY',
    "preferredFields" TEXT[],
    "isDegreeRequired" BOOLEAN NOT NULL DEFAULT false,
    "skills" TEXT[],
    "requirements" TEXT[],
    "benefits" TEXT[],
    "genderPreference" "GenderPreference" NOT NULL DEFAULT 'ANY',
    "englishFluency" "EnglishFluency" NOT NULL DEFAULT 'NONE',
    "applicationDeadline" TIMESTAMP(3),
    "openings" INTEGER NOT NULL DEFAULT 1,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "stipendType" "StipendType" NOT NULL,
    "stipendAmount" INTEGER,
    "stipendCurrency" "Currency" NOT NULL DEFAULT 'INR',
    "stipendPeriod" "StipendPeriod" NOT NULL DEFAULT 'MONTHLY',
    "durationValue" INTEGER NOT NULL,
    "durationUnit" "DurationUnit" NOT NULL,
    "isPPO" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "certificateProvided" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "experienceInYears" INTEGER NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "salaryPeriod" "SalaryPeriod" NOT NULL DEFAULT 'YEARLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "note" TEXT,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "listingType" "DraftType" NOT NULL,
    "listingId" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "interviewDate" TIMESTAMP(3),
    "employerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatLog" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChatLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "FeatureStatus" NOT NULL DEFAULT 'DISABLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturePermission" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_userId_companyId_key" ON "CompanyMember"("userId", "companyId");

-- CreateIndex
CREATE INDEX "Draft_companyId_idx" ON "Draft"("companyId");

-- CreateIndex
CREATE INDEX "Draft_postedById_idx" ON "Draft"("postedById");

-- CreateIndex
CREATE INDEX "BaseListing_companyId_idx" ON "BaseListing"("companyId");

-- CreateIndex
CREATE INDEX "BaseListing_postedById_idx" ON "BaseListing"("postedById");

-- CreateIndex
CREATE INDEX "BaseListing_status_idx" ON "BaseListing"("status");

-- CreateIndex
CREATE INDEX "BaseListing_opportunityType_idx" ON "BaseListing"("opportunityType");

-- CreateIndex
CREATE INDEX "BaseListing_city_country_idx" ON "BaseListing"("city", "country");

-- CreateIndex
CREATE INDEX "BaseListing_roleCategory_idx" ON "BaseListing"("roleCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Internship_listingId_key" ON "Internship"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_listingId_key" ON "Job"("listingId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_idx" ON "ApplicationStatusHistory"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_changedById_idx" ON "ApplicationStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "Application_jobSeekerId_idx" ON "Application"("jobSeekerId");

-- CreateIndex
CREATE INDEX "Application_listingId_idx" ON "Application"("listingId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_listingId_status_idx" ON "Application"("listingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_listingId_jobSeekerId_key" ON "Application"("listingId", "jobSeekerId");

-- CreateIndex
CREATE INDEX "AiChatLog_userId_createdAt_idx" ON "AiChatLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_slug_key" ON "Feature"("slug");

-- CreateIndex
CREATE INDEX "FeaturePermission_featureId_idx" ON "FeaturePermission"("featureId");

-- CreateIndex
CREATE INDEX "FeaturePermission_userId_idx" ON "FeaturePermission"("userId");

-- CreateIndex
CREATE INDEX "FeaturePermission_companyId_idx" ON "FeaturePermission"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturePermission_featureId_userId_key" ON "FeaturePermission"("featureId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturePermission_featureId_companyId_key" ON "FeaturePermission"("featureId", "companyId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseListing" ADD CONSTRAINT "BaseListing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseListing" ADD CONSTRAINT "BaseListing_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BaseListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BaseListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BaseListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatLog" ADD CONSTRAINT "AiChatLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturePermission" ADD CONSTRAINT "FeaturePermission_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturePermission" ADD CONSTRAINT "FeaturePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturePermission" ADD CONSTRAINT "FeaturePermission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
