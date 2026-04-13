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
// in the backend to handle status updates and then integrating that endpoint into the frontend with appropriate UI feedback
// for the user.
const Page = () => {
  const { data: responseData, isLoading, isError } = useGetMyJobPostings();

  const myJobPostings = responseData?.data?.jobPosts || [];

  if (isLoading) {
    return <JobTableSkeleton />;
  }

  if (isError) {
    return <div>Error occurred while fetching job postings.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Your Job Listings</CardTitle>
          <CardDescription>
            Manage status, edit jobs and track performance
          </CardDescription>
        </div>
        <Button asChild size="sm" className="h-9 gap-1">
          <Link href="/employer-dashboard/jobs/create">
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-62.5 font-semibold">Job Title</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Applications</TableHead>
              <TableHead className="font-semibold">Posted</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myJobPostings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              myJobPostings.map((job: any) => (
                <JobRow
                  key={job._id}
                  job={job}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Page;

function JobTableSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
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
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <Briefcase className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
      <p className="mt-1 max-w-75 text-center text-sm text-gray-500">
        You haven't posted any job listings yet. Get started by creating your
        first one.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/employer/jobs/new">Post Your First Job</Link>
      </Button>
    </div>
  );
}
