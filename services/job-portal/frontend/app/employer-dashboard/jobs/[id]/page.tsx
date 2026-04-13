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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: responseData, isLoading, isError } = useGetJobPostById(jobId as string);
  const job = responseData?.data;

  if (isLoading) return <JobSkeleton />;
  if (isError || !job) return <div className="p-10 text-center">Job not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline"  className="cursor-pointer" size="sm" onClick={() => router.push(`/employer/jobs/${jobId}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit Details
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>{job.title}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{job.status}</Badge>
                {job.isFeatured && <Badge>Featured</Badge>}
              </div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription>Posted on {format(new Date(job.createdAt), "PPP")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Requirements</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Skills</h4>
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
              <CardTitle className="text-sm font-medium">Post Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-muted/50">
                <FileUser className="h-4 w-4 mb-1 text-primary" />
                <span className="text-xl font-bold">{job.applicationsCount}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Applicants</span>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  ₹{job.salary.min.toLocaleString()} - ₹{job.salary.max.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{job.jobType.replace("_", " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location.city}, {job.location.state} {job.location.remote && "(Remote)"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{job.openings} Openings</span>
              </div>
            </CardContent>
            <Separator />
            <div className="p-4">
              <Button className="w-full" variant="outline">Manage Applicants</Button>
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
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex justify-between"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-40" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Skeleton className="h-[600px] w-full" /></div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}