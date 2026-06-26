"use client";

import { useGetRelatedJobsById } from "@/features/user/hooks/use-job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseIcon, MapPinIcon, Building2Icon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const RelatedJobs = ({ jobId }: { jobId: string }) => {
  const { data: response, isLoading, isError } = useGetRelatedJobsById(jobId);
  const relatedJobs = response?.data || [];

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Related Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || relatedJobs.length === 0) {
    return null; // Don't show anything if no related jobs or error
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Related Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedJobs.map((job: any) => (
          <Link href={`/job/${job._id}`} key={job._id} className="group block">
            <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-primary line-clamp-1 font-semibold group-hover:underline">
                  {job.title}
                </h4>
                {job.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-yellow-100 text-[10px] text-yellow-700"
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-1 flex items-center text-sm">
                <Building2Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                {job.company?.name}
              </p>
              <div className="text-muted-foreground mt-2 flex flex-wrap gap-2 text-xs">
                <div className="flex items-center capitalize">
                  <MapPinIcon className="mr-1 h-3 w-3" />
                  {job.workMode === "remote"
                    ? "Remote"
                    : job.location?.city || "Location not specified"}
                </div>
                <div className="flex items-center capitalize">
                  <BriefcaseIcon className="mr-1 h-3 w-3" />
                  {job.employmentType?.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
