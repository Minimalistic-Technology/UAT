"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetJobDetailsById } from "@/features/user/hooks/use-job";
import { useApplyJob } from "@/features/user/hooks/use-job-application";
import {
  BriefcaseIcon,
  MapPinIcon,
  WalletIcon,
  CalendarIcon,
  Building2Icon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session } = useSession();

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetJobDetailsById(jobId as string);
  const job = responseData?.data;

  const { mutate: applyJob, isPending: isApplying } = useApplyJob();

  const handleApply = () => {
    applyJob({
      jobId: jobId as string,
    });
  };

  if (isLoading) return <JobSkeleton />;
  
  if (isError || !job)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading job details.
      </div>
    );

  const canApply =
    session?.user?.role === "user" && session?.user?.isEmployee === false;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Main Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-primary text-3xl font-bold">
                    {job.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 flex items-center text-lg">
                    <Building2Icon className="mr-2 h-4 w-4" />
                    {job.company.name}
                  </p>
                </div>
                {job.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700"
                  >
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="text-muted-foreground flex items-center text-sm">
                  <MapPinIcon className="mr-1 h-4 w-4" />
                  {job.location.city}, {job.location.country}{" "}
                  {job.location.remote && "(Remote)"}
                </div>
                <div className="text-muted-foreground flex items-center text-sm">
                  <WalletIcon className="mr-1 h-4 w-4" />₹
                  {job.salary.min.toLocaleString()} - ₹
                  {job.salary.max.toLocaleString()} / {job.salary.period}
                </div>
                <div className="text-muted-foreground flex items-center text-sm">
                  <BriefcaseIcon className="mr-1 h-4 w-4" />
                  {job.jobType.replace("_", " ")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Requirements</h3>
                <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Posted On
                </span>
                <span className="font-medium">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4" /> Openings
                </span>
                <span className="font-medium">{job.openings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <BriefcaseIcon className="mr-2 h-4 w-4" /> Experience
                </span>
                <span className="font-medium capitalize">
                  {job.experienceLevel}
                </span>
              </div>

              <Separator className="my-4" />

              {canApply ? (
                <Button
                  className="h-12 w-full cursor-pointer text-lg font-semibold"
                  disabled={isApplying}
                  onClick={handleApply}
                >
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>
              ) : (
                <div className="bg-muted text-muted-foreground rounded-md p-3 text-center text-sm">
                  {!session
                    ? "Please login to apply for this job."
                    : "You are not eligible to apply for this role."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                About the Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold">{job.company.name}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {job.company.description ||
                  "Leading the industry in IT solutions and innovation."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Simple Skeleton Loader
const JobSkeleton = () => (
  <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
    <Skeleton className="h-40 w-full" />
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Skeleton className="h-96 lg:col-span-2" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export default Page;
