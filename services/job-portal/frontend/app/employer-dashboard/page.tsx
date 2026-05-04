"use client";

import Link from "next/link";
import {
  Plus,
  Users,
  Briefcase,
  CreditCard,
  ArrowUpRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatCard } from "@/features/employer/components/employer-stats-card";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data: responseData, isLoading, isError, isFetching } = useGetMyCompanyDetails();

  const companyDetails = responseData?.data;
  const isUnverified = companyDetails?.isVerified === false;
  const kycStatus = companyDetails?.kycStatus;

  if ((isLoading || !companyDetails) && !isError) {
    return <DashboardSkeleton />;
  }

  if (isFetching && !companyDetails) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500">
          Failed to load company details. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Employer Dashboard
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm font-medium">
            <span className="text-slate-700">{companyDetails?.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-muted-foreground">{companyDetails?.industry}</span>
          </div>
          <p className="text-muted-foreground mt-1">
            Overview of your active listings and candidate pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/employer-dashboard/plans">
              <CreditCard className="mr-2 h-4 w-4" />
              Plans
            </Link>
          </Button>

          <Button variant="default" asChild>
            <Link href="/employer-dashboard/jobs/create">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>
      </div>

      {isUnverified && !kycStatus && (
        <Alert
          variant="destructive"
          className="border-amber-200 bg-amber-50 text-amber-900 shadow-sm"
        >
          <AlertCircle className="h-5 w-5 !text-amber-600" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-amber-800">
                Action Required: Verify Your Business
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                Your account is currently unverified. To post jobs and view full
                applicant profiles, please complete your KYC verification.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
              asChild
            >
              <Link href="/employer-dashboard/settings/verify">
                Complete KYC
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      {isUnverified && kycStatus === "pending" && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900 shadow-sm">
          <AlertCircle className="h-5 w-5 !text-blue-600" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-blue-800">
                KYC Verification Pending
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Your KYC documents are currently under review. We will notify you once your account is verified.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {isUnverified && kycStatus === "rejected" && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 text-red-900 shadow-sm"
        >
          <AlertCircle className="h-5 w-5 !text-red-600" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-red-800">
                KYC Verification Rejected
              </AlertTitle>
              <AlertDescription className="text-red-700">
                Your recent KYC submission was rejected. Please review the requirements and submit again.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-red-300 bg-red-100 text-red-900 hover:bg-red-200"
              asChild
            >
              <Link href="/employer-dashboard/settings/verify">
                Re-submit KYC
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Jobs"
          value={Number(companyDetails?.activeJobs)}
          icon={Briefcase}
          description={`Total listings: ${companyDetails?.totalJobs}`}
        />

        <StatCard
          title="Team Members"
          value={Number(companyDetails?.totalMembers)}
          icon={Users}
          description="Members with dashboard access"
        />

        <StatCard
          isPrimary
          title="Current Plan"
          value={(companyDetails?.currentPlan?.name as string) || "Free Tier"}
          icon={ArrowUpRight}
          description={
            <Link href="/employer-dashboard/plans" className="hover:underline">
              {companyDetails?.subscription
                ? "Manage subscription"
                : "Upgrade now"}
            </Link>
          }
        />
      </div>

      {/* Placeholder for Recent Activity or Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            You have 12 unreviewed applications across all jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-50 items-center justify-center rounded-md border-2 border-dashed">
          <Button variant="ghost" asChild>
            <Link href="/employer-dashboard/applications">
              View All Applications
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Header Section Skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" /> {/* Title */}
          <Skeleton className="h-5 w-80" /> {/* Subtitle */}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-24" /> {/* Button 1 */}
          <Skeleton className="h-10 w-32" /> {/* Button 2 */}
        </div>
      </div>

      {/* Quick Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* Card Title */}
              <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" /> {/* Value */}
              <Skeleton className="h-4 w-32" /> {/* Description */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-md border-2 border-dashed" />
        </CardContent>
      </Card>
    </div>
  );
};
