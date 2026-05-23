"use client";

import { useState } from "react";
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

const EmployerApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus();
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams = {
    page,
    limit,
    ...(statusFilter !== "all" && { status: statusFilter }),
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
      case "under_review":
        return "secondary";
      case "shortlisted":
      case "selected":
        return "default";
      case "rejected":
      case "withdrawn":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage all the applications received across your company's jobs.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              {pagination?.totalItems || 0} total applications
            </CardDescription>
          </div>
          <div className="w-48">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
          ) : applications.length === 0 ? (
            <div className="text-muted-foreground py-20 text-center">
              No applications found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app: any) => (
                    <TableRow key={app._id}>
                      <TableCell>
                        <div className="font-medium">
                          {app.jobSeeker?.firstName} {app.jobSeeker?.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {app.jobSeeker?.email}
                        </div>
                      </TableCell>
                      <TableCell>{app.job?.title || "Unknown Job"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ApplicationDetailModal application={app} />

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                Quick Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-blue-600"
                                onClick={() => {
                                  setSelectedAppId(app._id);
                                  setInterviewModalOpen(true);
                                }}
                              >
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                                Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-green-600"
                                onClick={() =>
                                  handleUpdateStatus(app._id, "accepted")
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
                                Candidate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={() =>
                                  handleUpdateStatus(app._id, "rejected")
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Server Side Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Interview Date and Time</Label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-muted-foreground text-xs">
                Select a date and time in the future.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInterviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={isUpdating || !interviewDate}
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
