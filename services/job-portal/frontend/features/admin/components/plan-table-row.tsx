"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { useDeletePlan } from "../hooks/use-plan";
import { PlanEditDialog } from "./plan-edit-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plan } from "@/types/new-index";

export function PlanTableRow({ plan }: { plan: Plan }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();

  return (
    <>
      <TableRow>
        <TableCell>
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
        </TableCell>
        <TableCell className="text-muted-foreground hidden md:table-cell">
          {plan.price === 0 ? "Free" : `${plan.currency} ${plan.price}`}
        </TableCell>
        <TableCell className="text-muted-foreground hidden lg:table-cell">
          {plan.durationDays} Days
        </TableCell>
        <TableCell className="text-muted-foreground hidden xl:table-cell">
          {plan.jobPostLimit === -1 ? "Unlimited" : plan.jobPostLimit}
        </TableCell>
        <TableCell className="text-muted-foreground hidden xl:table-cell">
          {plan.teamMemberLimit === -1 ? "Unlimited" : plan.teamMemberLimit}
        </TableCell>
        <TableCell className="text-muted-foreground hidden xl:table-cell">
          {plan.postValidityDays}
        </TableCell>
        <TableCell>
          <Badge
            variant={plan.isActive ? "default" : "destructive"}
            className="font-medium"
          >
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground tabular-nums hidden md:table-cell">
          {new Date(Number(plan.createdAt)).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </TableCell>
        <TableCell className="text-right">
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
        </TableCell>
      </TableRow>

      <PlanEditDialog
        plan={plan}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
