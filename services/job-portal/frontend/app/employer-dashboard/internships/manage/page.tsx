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
import { useGetMyInternshipPostings } from "@/features/employer/hooks/use-internship";
import { Skeleton } from "@/components/ui/skeleton";
import { InternshipRow } from "@/features/employer/components/internship-row";

const Page = () => {
  const { data: responseData, isLoading, isError } = useGetMyInternshipPostings();

  const myInternshipPostings = responseData?.data?.internshipPosts || [];

  if (isLoading) {
    return <InternshipTableSkeleton />;
  }

  if (isError) {
    return <div>Error occurred while fetching internship postings.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Your Internship Listings</CardTitle>
          <CardDescription>
            Manage status, edit internships and track performance
          </CardDescription>
        </div>
        <Button asChild size="sm" className="h-9 gap-1">
          <Link href="/employer-dashboard/jobs/create">
            <Plus className="h-4 w-4" />
            <span>Post Internship</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-62.5 font-semibold">Internship Title</TableHead>
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
            {myInternshipPostings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              myInternshipPostings.map((internship: any) => (
                <InternshipRow
                  key={internship._id}
                  internship={internship}
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

function InternshipTableSkeleton() {
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
      <h3 className="text-lg font-semibold text-gray-900">No internships found</h3>
      <p className="mt-1 max-w-75 text-center text-sm text-gray-500">
        You haven't posted any internship listings yet. Get started by creating your
        first one.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/employer-dashboard/internships/create">Post Your First Internship</Link>
      </Button>
    </div>
  );
}