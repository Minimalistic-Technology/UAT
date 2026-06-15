"use client";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetMyJobPostings } from "@/features/employer/hooks/use-job";
import { Skeleton } from "@/components/ui/skeleton";
import { JobRow } from "@/features/employer/components/job-row";

// TODO: Implement the status change functionality and the updateStatusMutation for handling job status updates
// (e.g., activating, deactivating, or deleting a job posting). This will likely involve creating a new API endpoint
// (e.g., activating, deactivating, or deleting a job posting). This will likely involve creating a new API endpoint
// in the backend to handle status updates and then integrating that endpoint into the frontend with appropriate UI feedback
// for the user.
import { useState, useMemo } from "react";
import { GlobalSearchInput } from "@/components/global-search-input";
import { formatLocation } from "@/utils";

const Page = () => {
  const { data: responseData, isLoading, isError } = useGetMyJobPostings();
  const [searchQuery, setSearchQuery] = useState("");

  const myJobPostingsRaw = responseData?.data?.jobPosts || [];

  const myJobPostings = useMemo(() => {
    if (!searchQuery.trim()) return myJobPostingsRaw;
    const lowerQuery = searchQuery.toLowerCase();
    return myJobPostingsRaw.filter(
      (job: any) =>
        job.title?.toLowerCase().includes(lowerQuery) ||
        formatLocation(job.location)?.toLowerCase().includes(lowerQuery),
    );
  }, [myJobPostingsRaw, searchQuery]);

  if (isLoading) {
    return <JobTableSkeleton />;
  }

  if (isError) {
    return <div>Error occurred while fetching job postings.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search job listings..."
          />
        </div>
        <Button asChild size="sm" className="w-auto shrink-0 whitespace-nowrap px-3 sm:px-4">
          <Link
            href="/employer-dashboard/listings/create?type=job"
            className="flex items-center justify-center"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Post Job</span>
            <span className="sm:hidden">Post</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
        <CardHeader className="px-7 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Your Job Listings
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Manage status, edit jobs and track performance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-62.5 font-semibold">
                    Job Title
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applications</TableHead>
                  <TableHead className="font-semibold">Posted By</TableHead>
                  <TableHead className="font-semibold">Posted</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myJobPostings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                ) : (
                  myJobPostings.map((job: any) => (
                    <JobRow key={job._id} job={job} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

function JobTableSkeleton() {
  return (
    <Card className="mt-14 rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
      <CardHeader className="flex flex-row justify-between px-7 pt-6 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardHeader>

      <CardContent className="px-7 pb-6">
        <div className="space-y-4 rounded-md border p-4">
          {/* Header Row Placeholder */}
          <Skeleton className="h-10 w-full" />

          {/* Generic Repeating Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Briefcase className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
      <p className="mt-1 max-w-md text-center text-sm text-slate-500">
        You haven't posted any job listings yet. Get started by creating your first one.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/employer-dashboard/listings/create?type=job">
          Post Your First Job
        </Link>
      </Button>
    </div>
  );
}
