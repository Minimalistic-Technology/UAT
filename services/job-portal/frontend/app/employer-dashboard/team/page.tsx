"use client";

import { useState } from "react";
import {
  useDeleteEmployee,
  useGetAllEmployees,
} from "@/features/employer/hooks/use-company";
import { Loader2, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { data: responseData, isLoading, isError } = useGetAllEmployees();
  const deleteMutation = useDeleteEmployee();

  const employees = responseData?.data.employees || [];
  const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-50" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive p-20 text-center">
        <p>Failed to load team members. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your employees and their access levels.
        </p>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Users className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No team members</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              You haven't added any employees to your company yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-75">Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp: any) => {
                const isConfirming = confirmId === emp._id;
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === emp._id;

                return (
                  <TableRow
                    key={emp._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-indigo-50 text-xs font-bold text-indigo-700">
                            {getInitials(emp.user.firstName, emp.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm leading-none font-medium">
                            {emp.user.firstName} {emp.user.lastName}
                          </span>
                          <span className="text-muted-foreground mt-1 text-xs">
                            {emp.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground font-medium capitalize">
                      {emp.role}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={emp.isActive ? "outline" : "secondary"}
                        className={
                          emp.isActive
                            ? "border-green-200 bg-green-50 text-green-700"
                            : ""
                        }
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {isConfirming ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => {
                              deleteMutation.mutate(emp._id, {
                                onSuccess: () => setConfirmId(null),
                              });
                            }}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setConfirmId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => setConfirmId(emp._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove member</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Page;
