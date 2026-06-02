"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
    "internship",
  );

  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus();

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");

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

  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="mb-4 h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage and review candidates for this internship.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Total: {responseData?.data?.count || applications.length || 0}
        </Badge>
      </div>

      <div className="rounded-md border bg-white">
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
                  No applications found for this internship.
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
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
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

export default ApplicationsPage;