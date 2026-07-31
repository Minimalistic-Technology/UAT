"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Star, Clock } from "lucide-react";
import { useGetMyApplicationStats } from "@/features/user/hooks/use-job-application";
import { Skeleton } from "@/components/ui/skeleton";

export function UserQuickStats() {
  const { data: responseData, isLoading } = useGetMyApplicationStats();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const statsData = responseData?.data;

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Application Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Total Applied</span>
          </div>
          <span className="font-bold">{statsData?.total || 0}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Pending</span>
          </div>
          <span className="font-bold">{statsData?.byStatus.pending || 0}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Star className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Shortlisted</span>
          </div>
          <span className="flex items-center font-bold">
            {(statsData?.byStatus.shortlisted || 0) +
              (statsData?.byStatus.accepted || 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
