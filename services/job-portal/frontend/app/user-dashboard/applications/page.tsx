"use client";

import { useGetMyApplications } from "@/features/user/hooks/use-job-application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, AlertCircle, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationCard } from "@/features/user/components/application-card";

const MyApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch: refetchMyApplication,
  } = useGetMyApplications({ page, limit });

  if (isLoading) {
    return <ApplicationsSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Card className="border-destructive/20 bg-destructive/5 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-16">
            <AlertCircle className="text-destructive/80 h-10 w-10" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Failed to load applications
              </h2>
              <p className="text-muted-foreground text-sm">
                There was an error fetching your data. Please try again.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchMyApplication()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = responseData?.data.applications || [];
  const pagination = responseData?.data.pagination;

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    if (pagination?.totalPages && page < pagination.totalPages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="w-full space-y-6 p-1 md:space-y-8">
      <div className="flex flex-col gap-1.5 md:mb-6">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
          My Applications
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm font-medium md:text-base">
          Track and manage your {pagination?.totalItems || applications.length}{" "}
          active job applications all in one place.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((app: any) => (
            <ApplicationCard key={app._id} application={app} />
          ))
        ) : (
          <Card className="rounded-2xl border-dashed bg-slate-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Briefcase className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No Applications Yet
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                You haven't applied to any jobs yet. Start exploring and apply
                to jobs that match your skills!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Server Side Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="text-muted-foreground text-sm font-medium">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={page === 1}
              className="rounded-lg font-semibold"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={page >= pagination.totalPages}
              className="rounded-lg font-semibold"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;

const ApplicationsSkeleton = () => {
  return (
    <div className="w-full space-y-8 p-1">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-[350px]" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
};
