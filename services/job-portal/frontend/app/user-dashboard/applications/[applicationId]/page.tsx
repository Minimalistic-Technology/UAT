"use client";
import { useGetApplicationById } from "@/features/user/hooks/use-job-application";
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
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import {
  getInlineUrl,
  getApplicationStatusColor,
  formatLocation,
} from "@/utils";

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

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !application) return <ErrorState />;

  const {
    listing,
    listingType,
    status,
    createdAt,
    resume,
    interviewDate,
    statusHistory,
  } = application;

  return (
    <div className="animate-in fade-in w-full space-y-6 p-1 duration-500 md:space-y-8">
      <TopActions />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-3">
        {/* Left Column: Job Details & Documents */}
        <div className="space-y-6 md:space-y-8 lg:col-span-2">
          <Card className="border-secondary/20 overflow-hidden rounded-2xl shadow-sm">
            <div className="bg-primary/10 h-4 w-full" />
            <CardHeader className="pb-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <Badge
                    className={`mb-3 rounded-md px-3 py-1 ${getApplicationStatusColor(status)} border border-current/10 text-[10px] font-extrabold tracking-widest uppercase`}
                  >
                    {status}
                  </Badge>
                  <CardTitle className="mb-2 border-none text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
                    {listing?.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-medium">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {listing?.company?.name || "Company Name"}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {formatLocation(listing?.location)}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="border-secondary/10 space-y-6 rounded-b-2xl border-t bg-slate-50/50 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-secondary/10 flex items-center gap-3 rounded-xl border bg-white p-4 shadow-xs">
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Role Type
                    </p>
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {listing?.employmentType?.replace("_", " ") ||
                        listingType}
                    </p>
                  </div>
                </div>

                <div className="border-secondary/10 flex items-center gap-3 rounded-xl border bg-white p-4 shadow-xs">
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Applied Date
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(new Date(createdAt), "PPP")}
                    </p>
                  </div>
                </div>

                {interviewDate && (
                  <div className="col-span-1 flex items-center gap-3 rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 shadow-xs sm:col-span-2">
                    <div className="shrink-0 rounded-lg bg-[#2563eb] p-2.5 text-white">
                      <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="mb-0.5 text-[11px] font-bold tracking-wider text-[#2563eb]/60 uppercase">
                        Interview Scheduled
                      </p>
                      <p className="text-sm font-bold text-[#2563eb]">
                        {format(new Date(interviewDate), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Documents */}
          <Card className="border-secondary/20 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Attached Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-secondary/20 flex flex-col items-center gap-4 rounded-xl border bg-slate-50/50 p-4 sm:flex-row">
                <div className="rounded-xl bg-red-100/50 p-3 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-file-text"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate text-sm font-bold text-slate-900">
                    Submitted Resume
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    PDF Document format
                  </p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <a
                    href={getInlineUrl(resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="border-secondary/20 w-full gap-2 rounded-lg bg-white text-xs font-bold hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </a>
                  <a
                    href={resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 sm:flex-none"
                  >
                    <Button className="w-full gap-2 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800">
                      <Download className="h-3.5 w-3.5" /> Save
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline Widget */}
        <div className="lg:col-span-1">
          <Card className="border-secondary/20 sticky top-6 rounded-2xl shadow-sm">
            <CardHeader className="border-secondary/10 rounded-t-2xl border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <CheckCircle2 className="text-primary h-5 w-5" />
                Track Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-6">
              {statusHistory && statusHistory.length > 0 ? (
                <div className="relative ml-3 space-y-6 border-l-2 border-slate-100">
                  {statusHistory.map((historyItem: any, index: number) => {
                    const isLast = index === statusHistory.length - 1;
                    return (
                      <div key={index} className="relative pl-6">
                        {/* Dot indicator */}
                        <div
                          className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-[3px] border-white shadow-sm ${isLast ? "bg-[#2563eb] ring-4 ring-[#2563eb]/20" : "bg-slate-300"}`}
                        />

                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold capitalize ${isLast ? "text-slate-900" : "text-slate-500"}`}
                          >
                            {historyItem.status}
                          </span>
                          <span className="mt-0.5 text-[11px] font-bold text-slate-400">
                            {format(
                              new Date(historyItem.changedAt),
                              "MMM d, yyyy · p",
                            )}
                          </span>
                          {historyItem.note && (
                            <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 italic">
                              "{historyItem.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-slate-400 italic">
                  No tracking history yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationPage;

function TopActions() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="-ml-4 cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
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

function ErrorState() {
  const router = useRouter();

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <AlertCircle className="text-destructive h-12 w-12" />
      <h2 className="text-2xl font-bold">Application Not Found</h2>
      <p className="text-muted-foreground">
        The application you are looking for does not exist or has been removed.
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
