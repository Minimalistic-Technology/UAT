"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Plan } from "@/types/new-index"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useDeletePlan } from "@/features/admin/hooks/use-plan"
import { PlanEditDialog } from "./plan-edit-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl sm:rounded-[24px]">
            <div className="p-6 sm:p-8 space-y-4">
              <AlertDialogHeader className="px-0">
                <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  This action cannot be undone. This will permanently delete the
                  plan "{plan.name}" and remove it from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <AlertDialogCancel className="mt-0 rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-sm font-semibold"
                onClick={() => deletePlan(plan._id)}
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
          <div className="font-medium text-sm">
            {plan.name}
          </div>
          {plan.isFeatured && (
            <Badge variant="secondary" className="bg-amber-100/50 text-amber-700 hover:bg-amber-100 uppercase tracking-widest text-[9px] font-bold mt-1">
              Featured
            </Badge>
          )}
          {plan.isDefault && (
            <Badge variant="secondary" className="bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 uppercase tracking-widest text-[9px] font-bold mt-1 ml-1">
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
    accessorKey: "durationDays",
    header: () => <div className="hidden lg:block">Duration</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden lg:block">
          {row.original.durationDays} Days
        </div>
      );
    },
  },
  {
    accessorKey: "jobPostLimit",
    header: () => <div className="hidden xl:block">Jobs Limit</div>,
    cell: ({ row }) => {
      const limit = row.original.jobPostLimit;
      return (
        <div className="text-muted-foreground hidden xl:block">
          {limit === -1 ? "Unlimited" : limit}
        </div>
      );
    },
  },
  {
    accessorKey: "teamMemberLimit",
    header: () => <div className="hidden xl:block">Team Limit</div>,
    cell: ({ row }) => {
      const limit = row.original.teamMemberLimit;
      return (
        <div className="text-muted-foreground hidden xl:block">
          {limit === -1 ? "Unlimited" : limit}
        </div>
      );
    },
  },
  {
    accessorKey: "postValidityDays",
    header: () => <div className="hidden xl:block">Post Validity</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden xl:block">
          {row.original.postValidityDays}
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
        <div className="text-muted-foreground tabular-nums hidden md:block">
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
]
