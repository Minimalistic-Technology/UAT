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
  MonitorIcon,
  GraduationCapIcon,
  ClockIcon,
  AwardIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyCard } from "@/components/company-card";
import { ListingType } from "@/types/enums";

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
  console.log("job", job);

  const { mutate: applyJob, isPending: isApplying } = useApplyJob();

  const handleApply = () => {
    applyJob({
      listingId: jobId as string,
      listingType: job?.employmentType === "internship" ? "internship" as ListingType : "job" as ListingType,
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
            <CardHeader>
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
                  {job.location?.city
                    ? `${job.location.city}, ${job.location.country}`
                    : "Location not specified"}
                </div>

                {job.workMode && (
                  <div className="text-muted-foreground flex items-center text-sm capitalize">
                    <MonitorIcon className="mr-1 h-4 w-4" />
                    {job.workMode.replace(/_/g, " ")}
                  </div>
                )}

                {job.salary && (
                  <div className="text-muted-foreground flex items-center text-sm">
                    <WalletIcon className="mr-1 h-4 w-4" />
                    {job.salary.min || job.salary.max
                      ? `${job.salary.currency} ${
                          job.salary.min && job.salary.max
                            ? `${job.salary.min} - ${job.salary.max}`
                            : job.salary.min
                              ? `${job.salary.min}+`
                              : `Up to ${job.salary.max}`
                        } / ${job.salary.period}`
                      : "Salary not disclosed"}
                  </div>
                )}

                {job.stipend && (
                  <div className="text-muted-foreground flex items-center text-sm capitalize">
                    <WalletIcon className="mr-1 h-4 w-4" />
                    {job.stipend.type === "unpaid"
                      ? "Unpaid"
                      : `${job.stipend.currency || "₹"}${job.stipend.amount?.toLocaleString() || "Variable"} / ${job.stipend.period}`}
                  </div>
                )}

                <div className="text-muted-foreground flex items-center text-sm capitalize">
                  <BriefcaseIcon className="mr-1 h-4 w-4" />
                  {job.employmentType?.replace(/_/g, " ")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Requirements</h3>
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      {job.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {job.skills && job.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">
                      Skills Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill: string) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Benefits</h3>
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      {job.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
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
                <span className="text-right font-medium">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              {job.applicationDeadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" /> Deadline
                  </span>
                  <span className="text-right font-medium">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4" /> Openings
                </span>
                <span className="text-right font-medium">{job.openings}</span>
              </div>

              {job.experienceLevel && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <BriefcaseIcon className="mr-2 h-4 w-4" /> Experience
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.experienceLevel?.replace(/_/g, " ")}{" "}
                    {job.experienceInYears !== undefined
                      ? `(${job.experienceInYears}+ yrs)`
                      : ""}
                  </span>
                </div>
              )}

              {job.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" /> Duration
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.duration.value} {job.duration.unit}
                  </span>
                </div>
              )}

              {job.isPPO !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <AwardIcon className="mr-2 h-4 w-4" /> PPO Offered
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.isPPO ? "Yes" : "No"}
                  </span>
                </div>
              )}

              {job.industry && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Building2Icon className="mr-2 h-4 w-4" /> Industry
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.industry?.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {job.roleCategory && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <BriefcaseIcon className="mr-2 h-4 w-4" /> Role
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.roleCategory?.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {job.education && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <GraduationCapIcon className="mr-2 h-4 w-4" /> Education
                  </span>
                  <span className="text-right font-medium capitalize">
                    {job.education.minimumDegree?.replace(/_/g, " ")}
                    {job.education.isRequired ? " (Req)" : ""}
                  </span>
                </div>
              )}

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

          <CompanyCard
            company={{
              ...job.company,
              location: job.company.location,
            }}
          />
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
