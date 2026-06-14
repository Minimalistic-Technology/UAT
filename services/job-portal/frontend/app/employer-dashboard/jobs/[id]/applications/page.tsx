"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

import {
  useGetApplicationsByJobId,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationDetailModal } from "@/features/employer/components/application-details-model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationStatus } from "@/types/enums";

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "interview":
    case "interviewing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const ApplicationsPage = () => {
  const params = useParams();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: responseData, isLoading } = useGetApplicationsByJobId(
    listingId as string,
    "job",
  );

  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus();

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState<Date | undefined>();
  const [interviewTime, setInterviewTime] = useState("");

  const applications = responseData?.data?.applications || [];

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      await updateStatus({ applicationId, status });
      toast.success(`Candidate marked as ${status.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to update candidate status.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedAppId || !interviewDate || !interviewTime) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const [hours, minutes] = interviewTime.split(":").map(Number);
    const finalDate = new Date(interviewDate);
    finalDate.setHours(hours, minutes);

    if (finalDate <= new Date()) {
      toast.error("Interview date and time must be in the future.");
      return;
    }

    try {
      await updateStatus({
        applicationId: selectedAppId,
        status: "interview",
        interviewDate: finalDate.toISOString(),
      });
      toast.success("Interview scheduled successfully!");
      setInterviewModalOpen(false);
      setInterviewDate(undefined);
      setInterviewTime("");
      setSelectedAppId(null);
    } catch (error) {
      toast.error("Failed to schedule interview.");
    }
  };

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage and review candidates for this position.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Total: {responseData?.data?.count || applications.length || 0}
        </Badge>
      </div>

      <div className="rounded-[20px] border-0 bg-white dark:bg-slate-900 shadow-[0_2px_15px_rgba(0,0,0,0.04)] overflow-hidden p-6 mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center"
                >
                  No applications found for this job.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app: any) => (
                <TableRow key={app._id}>
                  <TableCell>
                    <div className="font-medium">
                      {app.jobSeeker.firstName} {app.jobSeeker.lastName}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {app.jobSeeker.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(app.status)}
                      variant="outline"
                    >
                      {app.status.toUpperCase()}
                    </Badge>
                    {app.status === "interview" && app.interviewDate && (
                      <div className="text-muted-foreground mt-1 text-[10px]">
                        {new Date(app.interviewDate).toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {app.jobSeeker.experience?.[0]?.title ||
                        "Freshman / No Exp"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(app.createdAt).toLocaleDateString()}
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
                              ApplicationStatus.REJECTED,
                              ApplicationStatus.WITHDRAWN,
                            ].includes(app.status?.toLowerCase())}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-border z-50">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-blue-600"
                            onClick={() => {
                              setSelectedAppId(app._id);
                              setInterviewModalOpen(true);
                            }}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" /> Schedule
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={interviewModalOpen}
        onOpenChange={(open) => {
          setInterviewModalOpen(open);
          if (!open) {
            setSelectedAppId(null);
            setInterviewDate(undefined);
            setInterviewTime("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex flex-col space-y-2">
              <Label>Interview Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !interviewDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {interviewDate ? (
                      format(interviewDate, "d/M/yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={interviewDate}
                    onSelect={setInterviewDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Interview Time</Label>
              <Input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
              />
            </div>
            <div>
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
              disabled={isUpdating || !interviewDate || !interviewTime}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsPage;
