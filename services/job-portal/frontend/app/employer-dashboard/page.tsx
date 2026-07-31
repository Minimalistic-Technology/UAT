"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminStatusCard as StatCard } from "@/features/admin/components/stats-card";
import { useGetMyCompanyDashboardDetails } from "@/features/employer/hooks/use-company";
import { useRouter } from "next/navigation";
import {
  DashboardOverviewSkeleton,
  RecentApplicationsSkeleton,
} from "@/skeletons/employer/employer-dashboard";
import {
  DASHBOARD_STAT_CARDS,
  DASHBOARD_ALERTS,
} from "@/features/employer/config/dashboard.config";
import { DashboardStatusAlert } from "@/features/employer/components/dashboard/dashboard-status-alert";
import { RecentApplications } from "@/features/employer/components/dashboard/recent-applications";
import { DashboardError } from "@/errors/employer/employer-dashboard";
import { Building2, CreditCard, Plus } from "lucide-react";

const Page = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    isFetching,
    error,
  } = useGetMyCompanyDashboardDetails();

  const router = useRouter();

  const companyDetails = responseData?.data;

  if ((isLoading || !companyDetails) && !isError) {
    return (
      <div className="flex w-full flex-col">
        <DashboardOverviewSkeleton />
        <RecentApplicationsSkeleton />
      </div>
    );
  }

  if (isFetching && !companyDetails) {
    return (
      <div className="flex w-full flex-col">
        <DashboardOverviewSkeleton />
        <RecentApplicationsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <DashboardError
        title="Failed to load payload"
        message={error?.message || "Company details could not be established."}
      />
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
        {DASHBOARD_ALERTS.map(
          (alertConfig) =>
            alertConfig.condition(companyDetails) && (
              <DashboardStatusAlert
                key={alertConfig.id}
                config={alertConfig}
                kycRejectionReason={companyDetails?.kycRejectionReason}
              />
            ),
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD_STAT_CARDS.map((config) => (
          <StatCard
            key={config.id}
            label={config.label}
            value={config.getValue(companyDetails)}
            icon={config.icon}
            variant={config.variant}
            className={config.className}
          />
        ))}
      </div>

      {/* Recent Applications Table */}
      <RecentApplications />
    </div>
  );
};

export default Page;
