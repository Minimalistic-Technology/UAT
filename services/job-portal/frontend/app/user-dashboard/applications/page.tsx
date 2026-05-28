"use client";

import {
  useGetMyApplications,
  useWithdrawJobApplication,
} from "@/features/user/hooks/use-job-application";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  MapPin,
  Clock,
  Trash2,
  Loader2,
  ChevronRight,
  RefreshCcw,
  AlertCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
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

const MyApplicationsPage = () => {
  const {
    data: responseData,
    isLoading,
    isError,
    refetch: refetchMyApplication,
  } = useGetMyApplications();

  const { mutate: withdrawApplication, isPending } =
    useWithdrawJobApplication();

  if (isLoading) {
    return <ApplicationsSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
            <AlertCircle className="text-destructive/80 h-10 w-10" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Failed to load applications
              </h2>
              <p className="text-muted-foreground text-sm">
                There was an error fetching your data. Please try again.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchMyApplication()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = responseData?.data.applications || [];
  console.log("My applications", applications);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground text-sm">
          Manage your active job applications and track their progress.
        </p>
      </div>

      <Card className="border-muted/40 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="text-primary h-4 w-4" />
            Active Submissions ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Job Details
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Location
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Applied Date
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Company
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app: any) => (
                  <TableRow
                    key={app._id}
                    className="group hover:bg-muted/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground group-hover:text-primary text-sm font-bold transition-colors">
                          {app.listing?.title}
                        </span>
                        <span className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase">
                          {app.listing?.jobType?.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.listing?.location?.city}
                        {app.listing?.workMode === 'remote' && (
                          <Badge
                            variant="outline"
                            className="ml-1 h-4 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-600"
                          >
                            Remote
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(app.createdAt), "dd MMM yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {app.listing?.company?.name ?? "Unknown Company"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/user-dashboard/applications/${app._id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={app.status === "withdrawn"}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Withdraw
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently withdraw your application for this
                              position.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => withdrawApplication(app._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                            >
                              Withdraw Application
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplicationsPage;

const ApplicationsSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Simplified Table Skeleton */}
      <div className="border-muted/40 overflow-hidden rounded-xl border">
        <Table>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell className="py-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 opacity-50" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    withdrawn: "bg-slate-100 text-slate-600 border-slate-300",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2 py-0 text-[11px] font-semibold capitalize shadow-none",
        variants[status] || variants.pending,
      )}
    >
      {status}
    </Badge>
  );
};
