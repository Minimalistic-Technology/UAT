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

export function PlanTableRow({ plan }: { plan: any }) {
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
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] mt-1">
              Featured
            </Badge>
          )}
          {plan.isDefault && (
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] mt-1 ml-1">
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
        <TableCell>
          <Badge
            variant={plan.isActive ? "default" : "destructive"}
            className="font-medium"
          >
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground tabular-nums hidden md:table-cell">
          {new Date(plan.createdAt).toLocaleDateString(undefined, {
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
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the 
                    plan "{plan.name}" and remove it from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deletePlan(plan._id)}
                  >
                    Delete Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
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
