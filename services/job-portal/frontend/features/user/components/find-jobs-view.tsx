"use client";

import { Suspense, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Briefcase, SlidersHorizontal, MapPin } from "lucide-react";
import { useJobFilters } from "@/hooks/use-job-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobs } from "@/features/user/services/job.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

import { FilterSidebar } from "./filter-sidebar";

function JobsPageContent() {
  const { filters, debouncedFilters, updateParams } = useJobFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["jobs", debouncedFilters],
    queryFn: () => getJobs(debouncedFilters),
  });

  const pagination = responseData?.data?.pagination;
  const totalJobs = responseData?.data?.totalJobs;
  const jobs = responseData?.data?.jobs;

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
          Find Jobs
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium md:text-base">
          {totalJobs || 0} opportunities waiting for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="hidden lg:col-span-1 lg:block">
          <Card className="border-secondary/20 sticky top-20 shadow-sm">
            <CardContent className="p-6">
              <FilterSidebar />
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6 lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1">
              <Search className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-5 w-5 transition-colors" />
              <Input
                ref={searchInputRef}
                placeholder="Search job title, skills, or company..."
                className="border-secondary/20 focus-visible:ring-primary/20 h-12 rounded-xl bg-white pr-12 pl-12 text-base shadow-sm dark:bg-slate-900"
                value={filters.search}
                onChange={(e) => updateParams({ search: e.target.value })}
              />
              <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 md:flex">
                <kbd className="pointer-events-none inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 font-mono text-[11px] font-medium text-slate-500 select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            <div className="group relative flex-1">
              <MapPin className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-5 w-5 transition-colors" />
              <Input
                placeholder="City, state, or 'Remote'"
                className="border-secondary/20 focus-visible:ring-primary/20 h-12 rounded-xl bg-white pl-12 text-base shadow-sm dark:bg-slate-900"
                value={filters.remote ? "Remote" : filters.city || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.toLowerCase() === "remote") {
                    updateParams({ remote: "true", city: "" });
                  } else {
                    updateParams({ city: val, remote: "false" });
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-secondary/20 h-12 flex-1 gap-2 rounded-xl font-semibold shadow-sm sm:flex-none lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-2 pb-12">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
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

export function FindJobsView() {
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
