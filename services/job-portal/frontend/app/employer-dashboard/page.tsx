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
  Settings,
  Sparkles,
  FileText,
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
import { useAllEmployerApplications } from "@/features/employer/hooks/use-applications";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "applied":
    case "under_review":
      return "secondary";
    case "shortlisted":
    case "selected":
      return "default";
    case "rejected":
    case "withdrawn":
      return "destructive";
    default:
      return "outline";
  }
};

const Page = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    isFetching,
  } = useGetMyCompanyDetails();

  const { data: applicationsData, isLoading: isLoadingApps } =
    useAllEmployerApplications({ page: 1, limit: 5 });

  const router = useRouter();

  const companyDetails = responseData?.data;
  const isUnverified = companyDetails?.isVerified === false;
  const kycStatus = companyDetails?.kycStatus;
  const hasPlan = !!companyDetails?.currentPlan;

  const recentApplications = applicationsData?.data?.applications || [];
  const totalApplications = applicationsData?.data?.pagination?.totalItems || 0;

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
            <span className="text-muted-foreground">
              {companyDetails?.industry}
            </span>
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

          <Button
            variant="default"
            className="cursor-pointer"
            onClick={() => {
              router.push("/employer-dashboard/jobs/create");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Step 1: No plan purchased yet — must buy a plan before KYC */}
      {isUnverified && !hasPlan && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600!" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-amber-800">
                Action Required: Choose a Plan
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                To get started, please purchase a plan first. Once you have an
                active subscription, you will be able to complete your KYC
                verification and post jobs.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
              asChild
            >
              <Link href="/employer-dashboard/plans">
                View Plans
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      {/* Step 2: Plan purchased but KYC not yet started */}
      {isUnverified && hasPlan && !kycStatus && (
        <Alert
          variant="destructive"
          className="border-amber-200 bg-amber-50 text-amber-900 shadow-sm"
        >
          <AlertCircle className="h-5 w-5 text-amber-600!" />
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

      {/* Step 2a: KYC submitted and under review */}
      {isUnverified && hasPlan && kycStatus === "pending" && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900 shadow-sm">
          <AlertCircle className="h-5 w-5 text-blue-600!" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-blue-800">
                KYC Verification Pending
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Your KYC documents are currently under review. We will notify
                you once your account is verified.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Step 2b: KYC rejected — re-submission required */}
      {isUnverified && hasPlan && kycStatus === "rejected" && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 text-red-900 shadow-sm"
        >
          <AlertCircle className="h-5 w-5 text-red-600!" />
          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <AlertTitle className="font-bold text-red-800">
                KYC Verification Rejected
              </AlertTitle>
              <AlertDescription className="mt-1 text-red-700">
                Your recent KYC submission was rejected. Please review the
                requirements and submit again.
                {companyDetails?.kycRejectionReason && (
                  <div className="mt-3 rounded-md bg-red-100 p-3 text-sm text-red-900 shadow-inner">
                    <span className="block font-bold">
                      Reason for Rejection:
                    </span>
                    <span className="mt-1 block text-base leading-relaxed">
                      {companyDetails.kycRejectionReason}
                    </span>
                  </div>
                )}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Listings"
          value={Number(companyDetails?.activeListings)}
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
          title="Subscription Plan"
          value={companyDetails?.currentPlan?.name || "No Active Plan"}
          icon={ArrowUpRight}
          description={
            <Link
              href="/employer-dashboard/plans"
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {companyDetails?.subscription ? (
                <>
                  <Settings className="h-3 w-3" />
                  Manage Subscription
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Explore & Choose a Plan
                </>
              )}
            </Link>
          }
        />

        <StatCard
          title="Remaining Job Posts"
          value={
            companyDetails?.remainingJobPosts === -1
              ? "Unlimited"
              : companyDetails?.remainingJobPosts !== undefined &&
                  companyDetails?.remainingJobPosts !== null
                ? Number(companyDetails.remainingJobPosts)
                : 0
          }
          icon={FileText}
          description={
            companyDetails?.remainingJobPosts === -1
              ? "Post as many jobs as you want"
              : "Posts available in current plan"
          }
        />
      </div>

      {/* Recent Applications Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              You have {totalApplications} applications across all jobs.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/employer-dashboard/applications">
              View All Applications
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="text-muted-foreground flex h-32 items-center justify-center rounded-md border-2 border-dashed py-10 text-center">
              No recent applications found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Listing Title</TableHead>
                    <TableHead>Listing Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Applied At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApplications.map((app: any) => (
                    <TableRow key={app._id}>
                      <TableCell>
                        <div className="font-medium">
                          {app.jobSeeker?.firstName} {app.jobSeeker?.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {app.jobSeeker?.email}
                        </div>
                      </TableCell>
                      <TableCell>{app.listing?.title || "Unknown Title"}</TableCell>
                      <TableCell>{app.listingType || "Unknown Listing Type"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.listing?.company?.name ?? "Unknown Company"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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