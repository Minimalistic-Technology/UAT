import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, UserCheck, CreditCard, Loader2 } from "lucide-react";
import { useGetMyJobPostings } from "@/features/employer/hooks/use-job";
import { useAllEmployerApplications } from "@/features/employer/hooks/use-applications";

import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";

export function EmployerQuickStats() {
  const { data: companyResponse } = useGetMyCompanyDetails();
  const { data: jobsResponse, isLoading: isLoadingJobs } =
    useGetMyJobPostings();
  const { data: appsResponse, isLoading: isLoadingApps } =
    useAllEmployerApplications();

  const jobsCount =
    (jobsResponse?.data as any)?.count ??
    jobsResponse?.data?.jobPosts?.length ??
    0;
  const applicationsCount =
    appsResponse?.data?.count ?? appsResponse?.data?.applications?.length ?? 0;
  const currentPlan = companyResponse?.data?.currentPlan?.name || "Free";

  return (
    <div className="space-y-4">
      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Total Posted Jobs
            </p>
            {isLoadingJobs ? (
              <Loader2 className="mt-1 h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <p className="text-[1.5rem] leading-none font-bold text-slate-800 dark:text-white">
                {jobsCount}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-50 dark:bg-blue-900/30">
            <Briefcase className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Applications Received
            </p>
            {isLoadingApps ? (
              <Loader2 className="mt-1 h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <p className="text-[1.5rem] leading-none font-bold text-slate-800 dark:text-white">
                {applicationsCount}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-50 dark:bg-blue-900/30">
            <UserCheck className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Current Plan
            </p>
            <p className="mt-1 text-[1.1rem] leading-none font-bold text-slate-800 capitalize dark:text-white">
              {currentPlan}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-50 dark:bg-blue-900/30">
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
