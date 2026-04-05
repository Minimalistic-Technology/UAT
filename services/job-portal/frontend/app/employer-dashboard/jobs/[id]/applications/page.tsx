"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

import { useGetApplicationsByJobId } from "@/features/employer/hooks/use-applications";
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

const ApplicationsPage = () => {
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: responseData, isLoading } = useGetApplicationsByJobId(
    jobId as string,
  );

  const applications = responseData?.data?.applications || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "interviewing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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
            Manage and review candidates for this position.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Total: {responseData?.data?.count || 0}
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
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {app.jobSeeker.experience?.[0]?.title || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(app.appliedAt).toLocaleDateString()}
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
                          <DropdownMenuItem className="text-blue-600">
                            <Calendar className="mr-2 h-4 w-4" /> Schedule
                            Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
                            Candidate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
    </div>
  );
};

export default ApplicationsPage;
