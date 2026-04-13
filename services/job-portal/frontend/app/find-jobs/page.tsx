"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { JobType } from "@/types";
import { Search, Briefcase, SlidersHorizontal } from "lucide-react";
import { useJobFilters } from "@/hooks/use-job-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobs } from "@/features/user/services/job.service";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function JobsPageContent() {
  const { filters, debouncedFilters, updateParams } = useJobFilters();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["jobs", debouncedFilters],
    queryFn: () => getJobs(debouncedFilters),
  });

  const pagination = responseData?.data.pagination;
  const totalJobs = responseData?.data.totalJobs;
  const jobs = responseData?.data.jobs;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Job Type</label>
        <Select
          value={filters.jobType === "all" ? "" : filters.jobType}
          onValueChange={(val) => updateParams({ jobType: val || "all" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>

            {Object.values(JobType).map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Location</label>
        <div className="space-y-2">
          <Input
            placeholder="City"
            value={filters.city}
            onChange={(e) => updateParams({ city: e.target.value })}
          />
          <Input
            placeholder="State"
            value={filters.state}
            onChange={(e) => updateParams({ state: e.target.value })}
          />
          <Input
            placeholder="Country"
            value={filters.country}
            onChange={(e) => updateParams({ country: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="remote"
          checked={filters.remote}
          onCheckedChange={(checked) => updateParams({ remote: !!checked })}
        />
        <label htmlFor="remote" className="text-sm leading-none font-medium">
          Remote Only
        </label>
      </div>

      <Separator />

      <div className="space-y-4">
        <label className="text-sm font-semibold">Salary Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minSalary ?? ""}
            onChange={(e) => updateParams({ minSalary: e.target.value })}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxSalary ?? ""}
            onChange={(e) => updateParams({ maxSalary: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
          Find Jobs
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {totalJobs || 0} opportunities waiting for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="hidden lg:col-span-1 lg:block">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <FilterSidebar />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="space-y-6 lg:col-span-3">
          {/* Search bar & Mobile Filter Trigger */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Search job title, skills, or company..."
                className="h-11 pl-9"
                value={filters.search}
                onChange={(e) => updateParams({ search: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              {/* Mobile Filter Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 sm:flex-none lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-75 sm:w-100">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FilterSidebar />
                </SheetContent>
              </Sheet>

              <Button size="lg" className="flex-1 sm:flex-none">
                Search
              </Button>
            </div>
          </div>

          {isLoading ? (
            <JobSkeleton />
          ) : jobs?.length === 0 ? (
            <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border px-4 py-16 text-center md:py-20">
              <Briefcase className="text-muted-foreground mb-4 h-10 w-10" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs?.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col items-center justify-center gap-4 py-10 sm:flex-row">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() =>
                  updateParams({ page: Math.max(1, filters.page - 1) })
                }
              >
                Previous
              </Button>

              <div className="text-muted-foreground px-2 text-[10px] font-medium tracking-wider whitespace-nowrap uppercase sm:text-xs">
                Page {filters.page} of {pagination?.totalPages || 1}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= (pagination?.totalPages || 1)}
                onClick={() => updateParams({ page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10">
          <JobSkeleton />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

const JobSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </Card>
    ))}
  </div>
);
