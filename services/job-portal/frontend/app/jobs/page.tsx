"use client";

import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/lib/services/job.service";
import JobCard from "../../components/JobCard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { JobType, ExperienceLevel } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = {
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    jobType: searchParams.get("jobType") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    remote: searchParams.get("remote"),
    skills: searchParams.get("skills")?.split(",") || [],
    minSalary: searchParams.get("minSalary")
      ? Number(searchParams.get("minSalary"))
      : undefined,
    maxSalary: searchParams.get("maxSalary")
      ? Number(searchParams.get("maxSalary"))
      : undefined,
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  };

  const updateParams = (
    key: string,
    value: string | number | boolean | string[] | undefined,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    console.log("key: ", key, "value:", value)

    if (
      value === "" ||
      value === false ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      params.delete(key);
    } else {
      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
    }

    if (key !== "page") {
      params.set("page", "1");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobService.getJobs(filters),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find Your Next Opportunity
        </h1>
        <p className="text-gray-600 text-lg">
          {data?.data?.totalJobs || 0} jobs available
        </p>
      </div>

      {/* Search Card */}
      <Card className="p-6 shadow-sm border border-gray-200 mb-8">
        <div className="space-y-6">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search job title, keyword or company"
              value={filters.search}
              onChange={(e) => updateParams("search", e.target.value)}
              className="flex-1"
            />

            {/* This button should fetch the job as per the current filters on click */}
            <Button className="md:w-auto w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="State"
              value={filters.state}
              onChange={(e) => updateParams("state", e.target.value)}
            />
            <Input
              placeholder="Country"
              value={filters.country}
              onChange={(e) => updateParams("country", e.target.value)}
            />
            <Input
              placeholder="City"
              value={filters.city}
              onChange={(e) => updateParams("city", e.target.value)}
            />
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.jobType}
                onChange={(e) => updateParams("jobType", e.target.value)}
              >
                <option value="">All Types</option>
                {Object.values(JobType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.experienceLevel}
                onChange={(e) =>
                  updateParams("experienceLevel", e.target.value)
                }
              >
                <option value="">All Levels</option>
                {Object.values(ExperienceLevel).map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Remote */}
            <div className="flex items-center mt-6 md:mt-8">
              <input
                type="checkbox"
                checked={filters.remote === "yes"}
                onChange={(e) =>
                  updateParams("remote", e.target.checked ? true : undefined)
                }
                className="h-4 w-4"
              />
              <label className="ml-3 text-sm font-medium">Remote Only</label>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma separated)
              </label>
              <Input
                placeholder="react,node,typescript"
                value={filters.skills.join(",")}
                onChange={(e) =>
                  updateParams(
                    "skills",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
              />
            </div>

            {/* Min Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary
              </label>
              <Input
                type="number"
                value={filters.minSalary ?? ""}
                onChange={(e) =>
                  updateParams(
                    "minSalary",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>

            {/* Max Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <Input
                type="number"
                value={filters.maxSalary ?? ""}
                onChange={(e) =>
                  updateParams(
                    "maxSalary",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <Card className="text-center py-12">Error loading jobs</Card>
      ) : data?.data?.jobs?.length === 0 ? (
        <Card className="text-center py-12">No jobs found</Card>
      ) : (
        <>
          <div className="space-y-6">
            {data?.data?.jobs?.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {/* Pagination + Limit */}
          {data && data.totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12">
              <div>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    updateParams("limit", Number(e.target.value))
                  }
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => updateParams("page", filters.page - 1)}
                >
                  Previous
                </Button>

                <span>
                  Page {filters.page} of {data.totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={filters.page === data.totalPages}
                  onClick={() => updateParams("page", filters.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
