"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useAllEmployerApplications } from "@/features/employer/hooks/use-applications";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationDetailModal } from "@/features/employer/components/application-details-model";

const EmployerApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams = {
    page,
    limit,
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data: responseData, isLoading, isError } = useAllEmployerApplications(queryParams);

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    if (responseData?.data.pagination.totalPages && page < responseData.data.pagination.totalPages) {
      setPage((p) => p + 1);
    }
  };

  const applications = responseData?.data?.applications || [];
  const pagination = responseData?.data?.pagination;

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
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
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
            <div className="py-10 text-center text-destructive">
              Failed to load applications. Please try again.
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
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
                        <div className="text-xs text-muted-foreground">
                          {app.jobSeeker?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.job?.title || "Unknown Job"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <ApplicationDetailModal application={app} />
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
              <div className="text-sm text-muted-foreground">
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
    </div>
  );
};

export default EmployerApplicationsPage;