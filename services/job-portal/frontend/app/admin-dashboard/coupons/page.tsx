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

import { useFetchAdminCoupons } from "@/features/admin/hooks/use-coupon";
import { CouponTableRow } from "@/features/admin/components/coupon-table-row";

const COLUMNS = [
  { key: "code", label: "Coupon Code" },
  { key: "type", label: "Type", className: "hidden sm:table-cell" },
  { key: "value", label: "Value" },
  { key: "maxUses", label: "Max Uses", className: "hidden lg:table-cell" },
  { key: "status", label: "Status" },
  { key: "expiry", label: "Expiry Date", className: "hidden md:table-cell" },
  { key: "actions", label: "Actions" },
];

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useFetchAdminCoupons(page, 10);

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-12 text-center">
          <p className="text-destructive mb-4 font-medium">
            Failed to load coupons data.
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
          <Skeleton className="h-10 w-36" />
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

  const coupons = responseData?.data?.data || responseData?.data?.coupons || responseData?.data || [];
  const pagination = responseData?.data?.pagination;

  // Client-side filtering
  const filteredCoupons = Array.isArray(coupons) ? coupons.filter((coupon: any) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-4">
      {/* Search and Filters Area */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search coupons..."
            className="bg-background pl-9 uppercase placeholder:normal-case"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Link href="/admin-dashboard/coupons/create">
          <Button className="cursor-pointer bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Coupons Management</CardTitle>
          <CardDescription>
            Manage discount codes, values, limits, and expirations.
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
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon: any) => (
                    <CouponTableRow key={coupon._id} coupon={coupon} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No coupons found.
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