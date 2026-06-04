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
  FileUser,
  Calendar,
  Award,
} from "lucide-react";
import { format } from "date-fns";

import { useGetInternshipPostById } from "@/features/employer/hooks/use-internship";
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
import { Internship } from "@/types/new-index";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const internshipId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetInternshipPostById(internshipId as string);
  const internship: Internship = responseData?.data;

  if (isLoading) return <InternshipSkeleton />;
  if (isError || !internship)
    return <div className="p-10 text-center">Internship not found.</div>;

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
            disabled={internship.status === "closed"}
            onClick={() => {
              router.push(`/employer-dashboard/internships/${internshipId}/edit`);
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
                <AlertDialogTitle>Delete Internship Posting?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>{internship.title}</strong>.
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
        {/* Left Column: Internship Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {internship.status.replace("_", " ").toLowerCase()}
                </Badge>
                {internship.isFeatured && <Badge>Featured</Badge>}
                {internship.isPPO && <Badge variant="outline" className="border-green-500 text-green-600">PPO Available</Badge>}
                {internship.certificateProvided && <Badge variant="outline" className="border-blue-500 text-blue-600">Certificate</Badge>}
              </div>
              <CardTitle className="text-3xl font-bold">{internship.title}</CardTitle>
              <CardDescription>
                Posted on {format(new Date(internship.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 font-semibold">Description</h4>
                <FormattedDescription text={internship.description} />
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">Requirements</h4>
                <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
                  {internship.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill: string) => (
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
                  {internship.applicationsCount}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  Applicants
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Internship Details Card */}
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
                  {internship.stipend.type === "fixed" && internship.stipend.amount
                    ? `₹${internship.stipend.amount.toLocaleString()} / ${internship.stipend.period}`
                    : internship.stipend.type === "unpaid"
                    ? "Unpaid"
                    : "Performance Based"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">
                  {internship.duration.value} {internship.duration.unit.toLowerCase()}{internship.duration.value > 1 && !internship.duration.unit.endsWith('s') ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <span className="capitalize">
                  {internship.employmentType.replace("_", " ").toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>
                  {internship.location?.city}, {internship.location?.state}{" "}
                  ({internship.workMode})
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="text-muted-foreground h-4 w-4" />
                <span>{internship.openings} Openings</span>
              </div>
              {internship.startDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>Start: {format(new Date(internship.startDate), "PP")}</span>
                </div>
              )}
              {internship.certificateProvided && (
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <Award className="h-4 w-4" />
                  <span>Certificate Provided</span>
                </div>
              )}
            </CardContent>
            <Separator />
            <div className="p-4">
              <Button
                onClick={() =>
                  router.push(`/employer-dashboard/internships/${internshipId}/applications`)
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

function InternshipSkeleton() {
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