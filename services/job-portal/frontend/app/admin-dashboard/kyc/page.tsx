"use client";

import * as React from "react";
import { Search, FileText, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useGetKycApplications,
  useUpdateKycApplicationStatus,
} from "@/features/admin/hooks/use-kyc";
import { KycTable } from "@/features/admin/components/kyc-application-table";

export default function KycManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetKycApplications({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateKycApplicationStatus();

  const applications = responseData?.data?.applications || [];
  const pagination = responseData?.data?.pagination;

  const filteredApps = applications.filter((app: any) => {
    const search = searchTerm.toLowerCase();
    return (
      app.companyName?.toLowerCase().includes(search) ||
      app.user?.email?.toLowerCase().includes(search)
    );
  });

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 m-6">
        <CardContent className="p-12 text-center">
          <p className="text-destructive mb-4 font-medium">
            Failed to load KYC applications.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-end gap-4">
        {/* <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search company or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-37.5 cursor-pointer">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="text-primary h-5 w-5" />
            Employer KYC Applications
          </CardTitle>
          <CardDescription>
            Review credentials for employer verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KycTable
            applications={filteredApps}
            isLoading={isLoading}
            isUpdating={isUpdating}
            onUpdateStatus={(applicationId, status) =>
              updateStatus({ applicationId, status })
            }
          />

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination?.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer"
            >
              Previous
            </Button>

            <div className="px-2 text-xs font-medium">
              Page {pagination?.currentPage || 1} of{" "}
              {pagination?.totalPages || 1}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
