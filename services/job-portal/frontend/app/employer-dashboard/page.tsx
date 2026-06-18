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
  Building2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AdminStatusCard as StatCard } from "@/features/admin/components/stats-card";
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
import { getApplicationStatusColor } from "@/utils";

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
      <div className="text-destructive flex h-96 flex-col items-center justify-center">
        <AlertCircle className="mb-4 size-8 opacity-50" />
        <p className="text-lg font-semibold">Failed to load payload</p>
        <p className="text-sm opacity-80">
          Company details could not be established.
        </p>
      </div>
    );
  }

  return (
    <div className="text-foreground flex w-full flex-col">
      {/* Header Section */}
      <div className="mb-4 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight">
            Employer Overview
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="text-primary bg-primary/10 rounded-full px-2.5 py-0.5 font-bold">
              {companyDetails?.name}
            </span>
            <span className="text-muted-foreground opacity-50">•</span>
            <span className="text-muted-foreground flex items-center">
              <Building2 className="mr-1.5 h-3.5 w-3.5" />
              {companyDetails?.industry}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link href="/employer-dashboard/plans">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Plan
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/employer-dashboard/listings/create")}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        {/* Step 1: No plan purchased yet */}
        {isUnverified && !hasPlan && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm sm:p-5">
            <div className="flex flex-1 items-start gap-4">
              <div className="rounded-full bg-amber-500/20 p-2 text-amber-500">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-amber-700 sm:text-base dark:text-amber-500">
                  Action Required: Choose a Subscription
                </h3>
                <p className="text-xs text-amber-700/80 sm:text-sm dark:text-amber-500/80">
                  To get started, please purchase a plan first. Once subscribed,
                  you will be able to complete KYC and post jobs.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              asChild
              className="ml-4 shrink-0 rounded-lg bg-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"
            >
              <Link href="/employer-dashboard/plans">
                View Plans <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}

        {/* Step 2: Plan purchased but KYC not yet started */}
        {isUnverified && hasPlan && !kycStatus && (
          <div className="border-destructive/30 bg-destructive/10 flex items-center justify-between rounded-xl border p-4 shadow-sm sm:p-5">
            <div className="flex flex-1 items-start gap-4">
              <div className="bg-destructive/20 text-destructive rounded-full p-2">
                <ShieldAlert className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-destructive text-sm font-bold sm:text-base">
                  Business Verification Required
                </h3>
                <p className="text-destructive/80 text-xs sm:text-sm">
                  Your account is currently unverified. To activate job posts
                  and unlock full access, please complete your KYC document
                  verification.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              asChild
              className="shadow-destructive/20 ml-4 shrink-0 rounded-lg font-bold shadow-lg"
            >
              <Link href="/employer-dashboard/settings/verify">
                Complete KYC <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}

        {/* Step 2a: KYC submitted and under review */}
        {isUnverified && hasPlan && kycStatus === "pending" && (
          <div className="border-secondary/30 bg-secondary/10 flex items-center justify-between rounded-xl border p-4 shadow-sm sm:p-5">
            <div className="flex flex-1 items-start gap-4">
              <div className="bg-secondary/20 text-secondary rounded-full p-2">
                <Loader2 className="size-5 animate-spin" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-secondary text-sm font-bold sm:text-base">
                  Verification in Progress
                </h3>
                <p className="text-secondary/80 text-xs sm:text-sm">
                  Your KYC documents are currently under priority review. We
                  will notify you once verification is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2b: KYC rejected */}
        {isUnverified && hasPlan && kycStatus === "rejected" && (
          <div className="border-destructive/30 bg-destructive/10 flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-start gap-4">
                <div className="bg-destructive/20 text-destructive rounded-full p-2">
                  <ShieldAlert className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-destructive text-sm font-bold sm:text-base">
                    KYC Rejected
                  </h3>
                  <p className="text-destructive/80 text-xs sm:text-sm">
                    Your recent submission was rejected. Re-submit your
                    documents referencing the feedback provided below.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                asChild
                className="shadow-destructive/20 ml-4 shrink-0 rounded-lg font-bold shadow-lg"
              >
                <Link href="/employer-dashboard/settings/verify">
                  Re-submit Details
                </Link>
              </Button>
            </div>
            {companyDetails?.kycRejectionReason && (
              <div className="bg-destructive/5 border-destructive/10 ml-14 rounded-lg border p-3">
                <span className="text-destructive mb-1 block text-xs font-bold tracking-wider uppercase">
                  Feedback
                </span>
                <span className="text-destructive/90 text-sm font-medium">
                  {companyDetails.kycRejectionReason}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Listings"
          value={Number(companyDetails?.activeListings)}
          icon={<Briefcase />}
          variant="default"
          className="border-primary/20 bg-card/50 hover:bg-card transition-colors duration-300"
        />

        <StatCard
          label="Team Members"
          value={Number(companyDetails?.totalMembers)}
          icon={<Users />}
          variant="default"
          className="border-secondary/20 bg-card/50 hover:bg-card transition-colors duration-300"
        />

        <StatCard
          label="Subscription"
          value={companyDetails?.currentPlan?.name || "No Plan"}
          icon={<Sparkles />}
          variant="warning"
          className="bg-premium/5 ring-premium/10 shadow-[0_0_20px_rgba(var(--premium-rgb),0.1)] ring-1 transition-colors duration-300"
        />

        <StatCard
          label="Remaining Job Posts"
          value={
            companyDetails?.remainingJobPosts === -1
              ? "Unlimited"
              : companyDetails?.remainingJobPosts !== undefined &&
                  companyDetails?.remainingJobPosts !== null
                ? Number(companyDetails.remainingJobPosts).toString()
                : "0"
          }
          icon={<FileText />}
          variant="default"
          className="border-primary/20 bg-card/50 hover:bg-card transition-colors duration-300"
        />
      </div>

      {/* Recent Applications Table */}
      <div className="relative overflow-hidden rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-heading text-foreground text-lg font-bold">
              Recent Candidate Pipeline
            </h3>
            <span className="text-muted-foreground mt-0.5 text-xs">
              Tracking {totalApplications} total applications.
            </span>
          </div>
          <Button
            variant="link"
            className="text-primary font-semibold hover:no-underline"
            asChild
          >
            <Link href="/employer-dashboard/applications">
              Pipeline Hub <ArrowUpRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          {isLoadingApps ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14 w-full rounded-xl opacity-50"
                />
              ))}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="border-border/50 bg-background/50 flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <span className="text-muted-foreground mb-1 text-sm font-semibold">
                No active pipeline candidates.
              </span>
              <span className="text-muted-foreground/60 text-xs">
                Jobs posted will gather applications here.
              </span>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-sm whitespace-nowrap">
              <thead>
                <tr className="border-border/50 text-muted-foreground border-b text-left text-xs font-bold tracking-wider uppercase">
                  <th className="pr-4 pb-3">Candidate</th>
                  <th className="px-4 pb-3">Position</th>
                  <th className="px-4 pb-3">Type</th>
                  <th className="px-4 pb-3">State</th>
                  <th className="pb-3 pl-4 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app: any) => {
                  const initials = app.jobSeeker?.firstName
                    ? app.jobSeeker.firstName.charAt(0)
                    : "U";
                  return (
                    <tr
                      key={app._id}
                      className="border-border/30 hover:bg-muted/10 border-b transition-colors last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`bg-primary/10 text-primary ring-background flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-xs ring-2`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground max-w-[150px] truncate text-sm font-bold">
                              {app.jobSeeker?.firstName}{" "}
                              {app.jobSeeker?.lastName}
                            </span>
                            <span className="text-muted-foreground max-w-[150px] truncate text-xs font-medium">
                              {app.jobSeeker?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-foreground max-w-[150px] truncate font-semibold">
                          {app.listing?.title || "Unknown Title"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                          {app.listingType || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className={`cursor-default border-0 px-3 py-1 font-bold shadow-sm ${getApplicationStatusColor(app.status)}`}
                        >
                          {app.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground py-4 pl-4 text-right text-xs font-medium whitespace-nowrap">
                        {format(new Date(app.createdAt), "MMM d, yyyy, h:mm a")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;

export const DashboardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
};
