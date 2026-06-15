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

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawJobApplication();

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
    <div className="w-full space-y-6 md:space-y-8 p-1 animate-in fade-in duration-500">
      <TopActions
        status={status}
        isWithdrawing={isWithdrawing}
        handleWithdraw={handleWithdraw}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

        {/* Left Column: Job Details & Documents */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card className="border-secondary/20 shadow-sm rounded-2xl overflow-hidden">
            <div className="h-4 bg-primary/10 w-full" />
            <CardHeader className="pb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <Badge
                    className={`mb-3 rounded-md px-3 py-1 ${getApplicationStatusColor(status)} border border-current/10 uppercase tracking-widest text-[10px] font-extrabold`}
                  >
                    {status}
                  </Badge>
                  <CardTitle className="mb-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 border-none">
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
            <CardContent className="space-y-6 bg-slate-50/50 p-6 rounded-b-2xl border-t border-secondary/10">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-secondary/10 shadow-xs">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Role Type</p>
                    <p className="text-sm font-semibold capitalize text-slate-900">
                      {listing?.employmentType?.replace("_", " ") || listingType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-secondary/10 shadow-xs">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Applied Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(new Date(createdAt), "PPP")}
                    </p>
                  </div>
                </div>

                {interviewDate && (
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-3 p-4 bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl shadow-xs">
                    <div className="p-2.5 bg-[#2563eb] text-white rounded-lg shrink-0">
                      <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#2563eb]/60 uppercase tracking-wider mb-0.5">Interview Scheduled</p>
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
          <Card className="border-secondary/20 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Attached Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-secondary/20 bg-slate-50/50">
                <div className="p-3 bg-red-100/50 text-red-600 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <p className="text-sm font-bold truncate text-slate-900">Submitted Resume</p>
                  <p className="text-[11px] font-semibold text-slate-400">PDF Document format</p>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <a href={getInlineUrl(resume)} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full bg-white hover:bg-slate-50 rounded-lg gap-2 text-xs font-bold border-secondary/20">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </a>
                  <a href={resume} target="_blank" rel="noopener noreferrer" download className="flex-1 sm:flex-none">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg gap-2 text-xs font-bold">
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
          <Card className="border-secondary/20 shadow-sm rounded-2xl sticky top-6">
            <CardHeader className="border-b border-secondary/10 bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Track Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              {statusHistory && statusHistory.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                  {statusHistory.map((historyItem: any, index: number) => {
                    const isLast = index === statusHistory.length - 1;
                    return (
                      <div key={index} className="relative pl-6">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-[3px] border-white shadow-sm ${isLast ? 'bg-[#2563eb] ring-4 ring-[#2563eb]/20' : 'bg-slate-300'}`} />

                        <div className="flex flex-col">
                          <span className={`text-sm font-bold capitalize ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>
                            {historyItem.status}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {format(new Date(historyItem.changedAt), "MMM d, yyyy · p")}
                          </span>
                          {historyItem.note && (
                            <p className="text-xs text-slate-600 bg-slate-50 mt-2 p-3 rounded-lg border border-slate-100 italic">
                              "{historyItem.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-4">No tracking history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationPage;

function TopActions({
  status,
  isWithdrawing,
  handleWithdraw,
}: {
  status: string;
  isWithdrawing: boolean;
  handleWithdraw: () => void;
}) {
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
      {!["withdrawn", "rejected", "accepted", "selected"].includes(
        status?.toLowerCase(),
      ) && (
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
