"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plan } from "@/types/new-index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useDeletePlan } from "@/features/admin/hooks/use-plan";
import { PlanEditDialog } from "./plan-edit-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ActionCell = ({ plan }: { plan: Plan }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 cursor-pointer"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl sm:rounded-[24px] dark:bg-slate-900">
            <div className="space-y-4 p-6 sm:p-8">
              <AlertDialogHeader className="px-0">
                <AlertDialogTitle className="text-xl font-bold">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  This action cannot be undone. This will permanently delete the
                  plan "{plan.name}" and remove it from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5 dark:border-slate-800 dark:bg-slate-800/50">
              <AlertDialogCancel className="mt-0 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-red-600 font-semibold text-white shadow-sm hover:bg-red-700"
                onClick={() => deletePlan(plan.id)}
              >
                Delete Plan
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <PlanEditDialog
        plan={plan}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
};

export const columns: ColumnDef<Plan>[] = [
  {
    accessorKey: "name",
    header: "Plan Name",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <>
          <div className="text-sm font-medium">{plan.name}</div>
          {plan.isDefault && (
            <Badge
              variant="secondary"
              className="mt-1 ml-1 bg-[#2563eb]/10 text-[9px] font-bold tracking-widest text-[#2563eb] uppercase hover:bg-[#2563eb]/20"
            >
              Default
            </Badge>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="hidden md:block">Price</div>,
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="text-muted-foreground hidden md:block">
          {plan.price === 0 ? "Free" : `${plan.currency} ${plan.price}`}
        </div>
      );
    },
  },
  {
    accessorKey: "subscriptionDurationDays",
    header: () => <div className="hidden lg:block">Duration</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden lg:block">
          {row.original.subscriptionDurationDays} Days
        </div>
      );
    },
  },
  {
    accessorKey: "maxActiveJobPosts",
    header: () => <div className="hidden xl:block">Jobs Limit</div>,
    cell: ({ row }) => {
      const limit = row.original.maxActiveJobPosts;
      return (
        <div className="text-muted-foreground hidden xl:block">
          {limit === -1 ? "Unlimited" : limit}
        </div>
      );
    },
  },
  {
    accessorKey: "maxTeamMembers",
    header: () => <div className="hidden xl:block">Team Limit</div>,
    cell: ({ row }) => {
      const limit = row.original.maxTeamMembers;
      return (
        <div className="text-muted-foreground hidden xl:block">
          {limit === -1 ? "Unlimited" : limit}
        </div>
      );
    },
  },
  {
    accessorKey: "jobPostValidityDays",
    header: () => <div className="hidden xl:block">Post Validity</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden xl:block">
          {row.original.jobPostValidityDays}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className="font-medium"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="hidden md:block">Created At</div>,
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div className="text-muted-foreground hidden tabular-nums md:block">
          {new Date(Number(createdAt)).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return <ActionCell plan={row.original} />;
    },
  },
];
