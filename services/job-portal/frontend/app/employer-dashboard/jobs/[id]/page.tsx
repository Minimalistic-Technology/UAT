"use client";

import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Clock,
  Users,
  IndianRupee,
  DollarSign,
  Euro,
  PoundSterling,
  Banknote,
  ChevronLeft,
  Pencil,
  Trash2,
  Eye,
  FileUser,
  Building2,
  Tags,
} from "lucide-react";
import { format } from "date-fns";

import { useGetJobPostById } from "@/features/employer/hooks/use-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormattedDescription } from "@/features/employer/components/formatted-description";
import {
  getCurrencyIcon,
  getCurrencySymbol,
  getListingStatusColor,
} from "@/utils";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetJobPostById(jobId as string);
  const job = responseData?.data;

  if (isLoading) return <JobSkeleton />;
  if (isError || !job)
    return <div className="p-10 text-center">Job not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-2 gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            disabled={job.status === "closed"}
            onClick={() =>
              router.push(`/employer-dashboard/jobs/${jobId}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Details
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>{job.title}</strong>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Job Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
            <CardHeader className="border-b bg-slate-50/50 pb-6 dark:bg-slate-800/50">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`px-3 py-1 capitalize shadow-sm ${getListingStatusColor(job.status)}`}
                >
                  {job.status.replace("_", " ").toLowerCase()}
                </Badge>
                {job.isFeatured && (
                  <Badge className="border-0 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-white shadow-sm">
                    Featured
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription>
                Posted on {format(new Date(job.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-muted-foreground bg-muted/30 border-border/50 flex flex-wrap items-center gap-4 rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Tags className="text-primary/70 h-4 w-4 shrink-0" />
                  <span className="capitalize">
                    <span className="text-foreground mr-1 font-semibold">
                      Role:
                    </span>
                    {job.roleCategory?.replace(/_/g, " ").toLowerCase() ||
                      "Not Specified"}
                  </span>
                </div>
                <Separator
                  orientation="vertical"
                  className="hidden h-4 sm:block"
                />
                <div className="flex items-center gap-1.5">
                  <Building2 className="text-primary/70 h-4 w-4 shrink-0" />
                  <span className="capitalize">
                    <span className="text-foreground mr-1 font-semibold">
                      Industry:
                    </span>
                    {job.industry?.replace(/_/g, " ").toLowerCase() ||
                      "Not Specified"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Description</h4>
                <FormattedDescription text={job.description} />
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">Requirements</h4>
                <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">Skills</h4>
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

        {/* Right Column: Stats & Meta */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Post Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border p-3">
                <FileUser className="text-primary mb-1 h-4 w-4" />
                <span className="text-xl font-bold">
                  {job.applicationsCount}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  Applicants
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Listing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                {getCurrencyIcon(job.currency || "INR")}
                <span className="font-medium">
                  {job.salary?.min || job.salary?.max ? (
                    <>
                      {job.salary?.min
                        ? `${getCurrencySymbol(job.currency || "INR")}${job.salary.min.toLocaleString()}`
                        : ""}
                      {job.salary?.min && job.salary?.max ? " - " : ""}
                      {job.salary?.max
                        ? `${getCurrencySymbol(job.currency || "INR")}${job.salary.max.toLocaleString()}`
                        : ""}
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Not Disclosed
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">
                  {job.employmentType.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">
                  {job.workMode === "remote"
                    ? "Remote"
                    : job.location?.city && job.location?.state
                      ? `${job.location.city}, ${job.location.state}`
                      : "Location Not Specified"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="text-muted-foreground h-4 w-4" />
                <span>{job.openings} Openings</span>
              </div>
            </CardContent>
            <Separator />
            <div className="p-4">
              <Button
                onClick={() =>
                  router.push(`/employer-dashboard/jobs/${jobId}/applications`)
                }
                className="w-full cursor-pointer"
                variant="outline"
              >
                Manage Applicants
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;

function JobSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[600px] w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
          <Skeleton className="h-[300px] w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
        </div>
      </div>
    </div>
  );
}
