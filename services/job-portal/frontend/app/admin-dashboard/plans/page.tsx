"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
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

import { useFetchAdminPlans } from "@/features/admin/hooks/use-plan";
import { PlanTableRow } from "@/features/admin/components/plan-table-row";

const COLUMNS = [
  { key: "plan", label: "Plan Name" },
  { key: "price", label: "Price", className: "hidden md:table-cell" },
  { key: "duration", label: "Duration", className: "hidden lg:table-cell" },
  { key: "limit", label: "Job Limit", className: "hidden xl:table-cell" },
  { key: "teamLimit", label: "Team Limit", className: "hidden xl:table-cell" },
  { key: "listingLifespan", label: "Listing Lifespan", className: "hidden xl:table-cell" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created At", className: "hidden md:table-cell" },
  { key: "actions", label: "Actions" },
];

export default function PlansPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useFetchAdminPlans(page, 10);

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-12 text-center">
          <p className="text-destructive mb-4 font-medium">
            Failed to load plans data.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-32" />
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
                        className={
                          column.key === "actions"
                            ? "text-right"
                            : column.className || ""
                        }
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
                        <TableCell
                          key={col.key}
                          className={col.className || ""}
                        >
                          <Skeleton
                            className={`h-5 ${
                              col.key === "actions" ? "ml-auto w-20" : "w-full"
                            }`}
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
  }

  const plans = responseData?.data?.plans || [];
  const pagination = responseData?.data?.pagination;

  // Client-side filtering (optional, backend usually does this but we'll do simple filtering based on searchTerm)
  const filteredPlans = plans.filter((plan: any) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Filters Area */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search plans..."
            className="bg-background pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Link href="/admin-dashboard/plans/create">
          <Button className="cursor-pointer bg-indigo-700 hover:bg-indigo-800">
            <Plus className="mr-2 h-4 w-4" /> Create Plan
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Plans Management</CardTitle>
          <CardDescription>
            Manage subscription plans, pricing, limits, and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      className={
                        column.key === "actions"
                          ? "text-right"
                          : column.className || ""
                      }
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredPlans) && filteredPlans.length > 0 ? (
                  filteredPlans.map((plan: any) => (
                    <PlanTableRow key={plan._id} plan={plan} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No plans found.
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
}