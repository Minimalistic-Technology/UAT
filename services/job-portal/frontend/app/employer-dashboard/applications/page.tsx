"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  useAllEmployerApplications,
  useUpdateApplicationStatus,
} from "@/features/employer/hooks/use-applications";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  FileSearch,
} from "lucide-react";
import { ApplicationDetailModal } from "@/features/employer/components/application-details-model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApplicationStatus } from "@/types/enums";
import { getApplicationStatusColor } from "@/utils";

const EmployerApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus();
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const queryParams = {
    page,
    limit,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearchQuery.trim() && { search: debouncedSearchQuery.trim() }),
  };

  const {
    data: responseData,
    isLoading,
    isError,
  } = useAllEmployerApplications(queryParams);

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    if (
      responseData?.data.pagination.totalPages &&
      page < responseData.data.pagination.totalPages
    ) {
      setPage((p) => p + 1);
    }
  };

  const applications = responseData?.data?.applications || [];
  const pagination = responseData?.data?.pagination;

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      await updateStatus({ applicationId, status });
      toast.success(`Candidate marked as ${status.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to update candidate status.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedAppId || !interviewDate) {
      toast.error("Please select a valid date and time.");
      return;
    }

    if (new Date(interviewDate) <= new Date()) {
      toast.error("Interview date and time must be in the future.");
      return;
    }

    try {
      await updateStatus({
        applicationId: selectedAppId,
        status: "interview",
        interviewDate: new Date(interviewDate).toISOString(),
      });
      toast.success("Interview scheduled successfully!");
      setInterviewModalOpen(false);
      setInterviewDate("");
      setSelectedAppId(null);
    } catch (error) {
      toast.error("Failed to schedule interview.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            All Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all the applications received across your company's jobs.
          </p>
        </div>
      </div>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
        <CardHeader className="flex flex-col items-start justify-between gap-4 px-7 pt-6 pb-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Applications
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {pagination?.totalItems || 0} total applications
            </CardDescription>
          </div>
          <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search candidate or job..."
                className="h-10 w-full rounded-xl pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-[130px] shrink-0 sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl px-3">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-7 pb-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-destructive py-10 text-center">
              Failed to load applications. Please try again.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Listing Title</TableHead>
                    <TableHead>Listing Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app: any) => {
                      const appId = app.id || app._id;
                      return (
                      <TableRow key={appId}>
                        <TableCell>
                          <div className="font-medium">
                            {app.jobSeeker?.firstName} {app.jobSeeker?.lastName}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {app.jobSeeker?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.listing?.title || "Unknown Listing Title"}
                        </TableCell>
                        <TableCell>
                          {app.listingType || "Unknown Listing Type"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`cursor-default border-0 px-3 py-1 font-bold shadow-sm ${getApplicationStatusColor(app.status)}`}
                          >
                            {app.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(
                            new Date(app.createdAt),
                            "MMM d, yyyy, h:mm a",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ApplicationDetailModal application={app} />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={[
                                    ApplicationStatus.ACCEPTED,
                                    ApplicationStatus.REJECTED,
                                    ApplicationStatus.WITHDRAWN,
                                  ].includes(app.status?.toLowerCase())}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="border-border z-50 w-48 bg-white dark:bg-slate-900"
                              >
                                <DropdownMenuLabel>
                                  Quick Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-blue-600"
                                  onClick={() => {
                                    setSelectedAppId(appId);
                                    setInterviewModalOpen(true);
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" /> Schedule
                                  Interview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-green-600"
                                  onClick={() =>
                                    handleUpdateStatus(appId, "accepted")
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />{" "}
                                  Accept Candidate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600"
                                  onClick={() =>
                                    handleUpdateStatus(appId, "rejected")
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Reject
                                  Candidate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );})
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Server Side Pagination Controls */}
          {pagination && pagination.totalPages >= 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-muted-foreground text-sm">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={interviewModalOpen}
        onOpenChange={(open) => {
          setInterviewModalOpen(open);
          if (!open) {
            setSelectedAppId(null);
            setInterviewDate("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-[95vw] overflow-y-auto rounded-2xl p-4 sm:w-full sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 sm:py-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">
                Interview Date and Time
              </Label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full text-base sm:text-sm"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Select a date and time in the future.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setInterviewModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={isUpdating || !interviewDate}
              className="w-full sm:w-auto"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerApplicationsPage;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full dark:bg-slate-800">
        <FileSearch className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        No applications found
      </h3>
      <p className="mt-1 max-w-md text-center text-sm text-slate-500">
        You haven't received any applications yet, or none match your search
        criteria.
      </p>
    </div>
  );
}
