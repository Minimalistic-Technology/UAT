"use client";

import React from "react";
import { Search } from "lucide-react";

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Features / Hooks
import { useFetchAllUsers } from "@/features/admin/hooks/use-user";
import UserTableRow from "@/features/admin/components/user-table-row";
import { cn } from "@/lib/utils";
import { CompanyRole } from "@/types";
import { UserWithCompany } from "@/features/admin/types";

const COLUMNS = [
  { key: "name", label: "User" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "Actions" },
];

const Page = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch: refetchUsers,
  } = useFetchAllUsers(page, 10);

  if (isError) return <ErrorState onRetry={() => refetchUsers()} />;

  if (isLoading) return <LoadingState />;

  const users = responseData?.data.users || [];
  const pagination = responseData?.data.pagination;

  // Search Logic: Filter based on Name, Email, or Company Name
  const filteredUsers = users.filter((user: UserWithCompany) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const company = user.companyName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || company.includes(search);
  });

  // Export CSV Logic
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;

    // Map column labels for the header
    const headers = COLUMNS.filter((col) => col.key !== "actions")
      .map((col) => col.label)
      .join(",");

    // Map user data
    const csvRows = filteredUsers.map((user: any) =>
      [
        `"${user.firstName} ${user.lastName}"`,
        `"${user.email}"`,
        `"${user.companyRole === CompanyRole.OWNER ? "Owner" : user.companyRole === CompanyRole.ADMIN ? "Admin" : user.companyRole === CompanyRole.RECRUITER ? "Recruiter" : "Job Seeker"}"`,
        `"${user.isActive ? "Active" : "Inactive"}"`,
        `"${new Date(user.createdAt).toLocaleDateString()}"`,
      ].join(","),
    );

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Area */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-slate-400 absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Search users by name, email, or company..."
            className="h-10 pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 focus-visible:ring-[#2563eb]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="rounded-xl border-[#2563eb]/20 text-[#2563eb] hover:bg-[#2563eb]/5 font-semibold h-10 px-5"
        >
          Export CSV
        </Button>
      </div>

      <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-4 pt-6 px-7">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">User Management</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            A list of all users in your organization and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.key === "actions" && "text-right",
                        column.key === "email" && "hidden md:table-cell",
                      )}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {COLUMNS.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton
                            className={`h-6 ${col.key === "actions" ? "ml-auto w-20" : "w-full"}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <UserTableRow key={user._id} user={user} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
};

export default Page;

const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-12 text-center">
        <p className="text-destructive mb-4 font-medium">
          Failed to load user management data.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      className={column.key === "actions" ? "text-right" : ""}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {COLUMNS.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton
                          className={`h-5 ${col.key === "actions" ? "ml-auto w-20" : "w-full"}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};