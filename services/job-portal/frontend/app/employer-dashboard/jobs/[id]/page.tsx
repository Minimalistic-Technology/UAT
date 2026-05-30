"use client";

import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Clock,
  Users,
  IndianRupee,
  ChevronLeft,
  Pencil,
  Trash2,
  Eye,
  FileUser,
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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
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
            // onClick={() => router.push(`/employer/jobs/${jobId}/edit`)}
            onClick={() => {
              alert("Edit functionality coming soon!")
            }}
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
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {job.status}
                </Badge>
                {job.isFeatured && <Badge>Featured</Badge>}
              </div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription>
                Posted on {format(new Date(job.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Listing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <IndianRupee className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">
                  ₹{job.salary?.min?.toLocaleString()} - ₹
                  {job.salary?.max?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">
                  {job.jobType.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>
                  {job.location.city}, {job.location.state}{" "}
                  {job.location.remote && "(Remote)"}
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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[600px] w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}
