"use client";
import {
  useGetApplicationById,
  useWithdrawJobApplication,
} from "@/features/user/hooks/use-job-application";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Download,
  ArrowLeft,
  Building2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "shortlisted":
      return "bg-indigo-100 text-indigo-800";
    case "interview":
      return "bg-purple-100 text-purple-800";
    case "offered":
      return "bg-green-100 text-green-800";
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getInlineUrl = (url: string) =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;

const formatLocation = (location: any) => {
  if (!location) return "Location Not Specified";
  if (typeof location === "string") return location;

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);

  let locationStr = parts.join(", ");
  if (location.remote) {
    locationStr = locationStr ? `${locationStr} (Remote)` : "Remote";
  }

  return locationStr || "Location Not Specified";
};

const ViewApplicationPage = () => {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  const {
    data: response,
    isLoading,
    isError,
  } = useGetApplicationById(applicationId);
  const application = response?.data;

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawJobApplication();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-destructive h-12 w-12" />
        <h2 className="text-2xl font-bold">Application Not Found</h2>
        <p className="text-muted-foreground">
          The application you are looking for does not exist or has been
          removed.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/user-dashboard/applications")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
      </div>
    );
  }

  const { job, status, createdAt, resume, interviewDate, statusHistory } =
    application;

  const handleWithdraw = () => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      withdrawApplication(applicationId, {
        onSuccess: () => {
          router.push("/user-dashboard/applications");
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-4 cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {status !== "withdrawn" &&
          status !== "rejected" &&
          status !== "accepted" && (
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="cursor-pointer"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
            </Button>
          )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="mb-2 text-2xl">{job?.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job?.company?.name || "Company Name"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formatLocation(job?.location)}
                </span>
              </CardDescription>
            </div>
            <Badge
              className={`rounded-full px-3 py-1 ${getStatusColor(status)} border-none capitalize`}
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>
                Job Type:{" "}
                <span className="text-foreground font-medium capitalize">
                  {job?.jobType}
                </span>
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Applied On:{" "}
                <span className="text-foreground font-medium">
                  {format(new Date(createdAt), "PPP")}
                </span>
              </span>
            </div>
            {interviewDate && (
              <div className="text-primary bg-primary/5 border-primary/10 col-span-1 flex items-center gap-2 rounded-lg border p-3 md:col-span-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Interview Scheduled:{" "}
                  {format(new Date(interviewDate), "PPP p")}
                </span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-semibold">Application Document</h3>
            <div className="flex items-center gap-3">
              <a
                href={getInlineUrl(resume)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Resume
                </Button>
              </a>

              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button
                  variant="secondary"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
            </div>
          </div>

          {statusHistory && statusHistory.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="mb-4 text-lg font-semibold">
                Application Timeline
              </h3>
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                {statusHistory.map((historyItem: any, index: number) => (
                  <div
                    key={index}
                    className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-slate-200 text-slate-500 shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <div
                        className={`h-3 w-3 rounded-full ${getStatusColor(historyItem.status).split(" ")[0]}`}
                      />
                    </div>
                    <div className="bg-card w-[calc(100%-4rem)] rounded border border-slate-200 p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="font-bold text-slate-900 capitalize">
                          {historyItem.status}
                        </div>
                        <time className="font-mono text-xs text-slate-500">
                          {format(new Date(historyItem.changedAt), "PP")}
                        </time>
                      </div>
                      {historyItem.note && (
                        <div className="mt-2 text-sm text-slate-500">
                          {historyItem.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewApplicationPage;
