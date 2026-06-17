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

import { useState, useMemo } from "react";
import { GlobalSearchInput } from "@/components/global-search-input";
import { formatLocation } from "@/utils";

const Page = () => {
  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetMyInternshipPostings();
  const [searchQuery, setSearchQuery] = useState("");

  const myInternshipPostingsRaw = responseData?.data?.internshipPosts || [];

  const myInternshipPostings = useMemo(() => {
    if (!searchQuery.trim()) return myInternshipPostingsRaw;
    const lowerQuery = searchQuery.toLowerCase();
    return myInternshipPostingsRaw.filter(
      (internship: any) =>
        internship.title?.toLowerCase().includes(lowerQuery) ||
        formatLocation(internship.location)?.toLowerCase().includes(lowerQuery),
    );
  }, [myInternshipPostingsRaw, searchQuery]);

  if (isLoading) {
    return <InternshipTableSkeleton />;
  }

  if (isError) {
    return <div>Error occurred while fetching internship postings.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search internships..."
          />
        </div>
        <Button
          asChild
          size="sm"
          className="w-auto shrink-0 px-3 whitespace-nowrap sm:px-4"
        >
          <Link
            href="/employer-dashboard/listings/create?type=internship"
            className="flex items-center justify-center"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            <span>Post New Internship</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
        <CardHeader className="px-7 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Your Internship Listings
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Manage status, edit internships and track performance.
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
                    Internship Title
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

function InternshipTableSkeleton() {
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
      <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full dark:bg-slate-800">
        <Briefcase className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        No jobs found
      </h3>
      <p className="mt-1 max-w-md text-center text-sm text-slate-500">
        You haven't posted any internship listings yet. Get started by creating
        your first one.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/employer-dashboard/listings/create?type=internship">
          Post Your First Internship
        </Link>
      </Button>
    </div>
  );
}
