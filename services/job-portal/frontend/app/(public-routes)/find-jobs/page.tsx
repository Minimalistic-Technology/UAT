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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

function JobsPageContent() {
  const { filters, debouncedFilters, updateParams } = useJobFilters();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["jobs", debouncedFilters],
    queryFn: () => getJobs(debouncedFilters),
  });

  const pagination = responseData?.data.pagination;
  const totalJobs = responseData?.data.totalJobs;
  const jobs = responseData?.data.jobs;

  const FilterSidebar = () => {
    const toggleArrayFilter = (key: string, value: string) => {
      const currentArray = (filters as any)[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];

      // If it's salary or stipend, we should calculate min and max and set them too
      const paramsToUpdate: any = { [key]: newArray };

      if (key === "salaryRanges") {
         let min = Infinity;
         let max = -Infinity;
         if (newArray.length === 0) {
           paramsToUpdate.minSalary = "";
           paramsToUpdate.maxSalary = "";
         } else {
           newArray.forEach(range => {
             const [rmin, rmax] = range.split("-").map(Number);
             if (rmin < min) min = rmin;
             if (rmax > max) max = rmax;
           });
           paramsToUpdate.minSalary = min * 100000;
           paramsToUpdate.maxSalary = max * 100000;
         }
      }

      if (key === "stipendRanges") {
         let min = Infinity;
         let max = -Infinity;
         const hasUnpaid = newArray.includes("unpaid");
         const ranges = newArray.filter(r => r !== "unpaid");
         
         if (newArray.length === 0) {
           paramsToUpdate.minStipend = "";
           paramsToUpdate.maxStipend = "";
           paramsToUpdate.stipendType = "";
         } else {
           if (hasUnpaid) paramsToUpdate.stipendType = "unpaid";
           else paramsToUpdate.stipendType = "";

           if (ranges.length > 0) {
             ranges.forEach(range => {
               const [rmin, rmax] = range.split("-").map(Number);
               if (rmin < min) min = rmin;
               if (rmax > max) max = rmax;
             });
             paramsToUpdate.minStipend = min * 1000; // e.g. 10k -> 10000
             paramsToUpdate.maxStipend = max * 1000;
           } else {
             paramsToUpdate.minStipend = "";
             paramsToUpdate.maxStipend = "";
           }
         }
      }

      updateParams(paramsToUpdate);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">All Filters</h3>
        </div>
        <Accordion type="multiple" defaultValue={["workMode", "experience", "department", "salary", "companyType", "stipend", "duration"]} className="w-full">
          {/* Work mode */}
          <AccordionItem value="workMode">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Work mode</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Work from office", value: "work from office" },
                  { label: "Hybrid", value: "hybrid" },
                  { label: "Remote", value: "remote" },
                  { label: "Temp. WFH due to...", value: "temporary work from home" }
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`wm-${item.value}`}
                      checked={filters.workMode.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('workMode', item.value)}
                    />
                    <label htmlFor={`wm-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience */}
          <AccordionItem value="experience">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Experience</AccordionTrigger>
            <AccordionContent>
              <div className="px-2 pt-4 pb-2">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[filters.experienceYears === "Any" ? 10 : Number(filters.experienceYears)]}
                  onValueChange={(vals) => {
                    const val = vals[0];
                    updateParams({ experienceYears: val === 10 ? "Any" : val.toString() });
                  }}
                />
                <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium">
                  <span>0 Yrs</span>
                  <span>{filters.experienceYears === "Any" ? "Any" : `${filters.experienceYears} Yrs`}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Department */}
          <AccordionItem value="department">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Department</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Engineering - Software", value: "software_development" },
                  { label: "Sales & Business Dev", value: "sales" },
                  { label: "Customer Success", value: "customer_support" },
                  { label: "Finance & Accounting", value: "finance" },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`dept-${item.value}`}
                      checked={filters.roleCategory.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('roleCategory', item.value)}
                    />
                    <label htmlFor={`dept-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Salary */}
          <AccordionItem value="salary">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Salary</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "0-3 Lakhs", value: "0-3" },
                  { label: "3-6 Lakhs", value: "3-6" },
                  { label: "6-10 Lakhs", value: "6-10" },
                  { label: "10-15 Lakhs", value: "10-15" },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`sal-${item.value}`}
                      checked={filters.salaryRanges.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('salaryRanges', item.value)}
                    />
                    <label htmlFor={`sal-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Company type */}
          <AccordionItem value="companyType">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Company type</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Foreign MNC", value: "foreign mnc" },
                  { label: "Corporate", value: "corporate" },
                  { label: "Indian MNC", value: "indian mnc" },
                  { label: "Startup", value: "startup" },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`ct-${item.value}`}
                      checked={filters.companyType.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('companyType', item.value)}
                    />
                    <label htmlFor={`ct-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Stipend */}
          <AccordionItem value="stipend">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Stipend</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Unpaid", value: "unpaid" },
                  { label: "0-10k", value: "0-10" },
                  { label: "10k-20k", value: "10-20" },
                  { label: "20k-30k", value: "20-30" },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`stipend-${item.value}`}
                      checked={filters.stipendRanges.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('stipendRanges', item.value)}
                    />
                    <label htmlFor={`stipend-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Duration */}
          <AccordionItem value="duration">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">Duration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: "1 Month", value: "1" },
                  { label: "2 Months", value: "2" },
                  { label: "3 Months", value: "3" },
                  { label: "6 Months", value: "6" },
                ].map((item) => (
                  <div key={item.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`dur-${item.value}`}
                      checked={filters.durationMonths.includes(item.value)}
                      onCheckedChange={() => toggleArrayFilter('durationMonths', item.value)}
                    />
                    <label htmlFor={`dur-${item.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

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
                <SheetContent side="left" className="w-75 sm:w-100 overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-2 pb-12">
                    <FilterSidebar />
                  </div>
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