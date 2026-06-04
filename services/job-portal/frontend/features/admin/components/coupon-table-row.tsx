"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteCoupon } from "../hooks/use-coupon";
import { CouponEditDialog } from "./coupon-edit-dialog";
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
import { Coupon } from "@/types/new-index";

export function CouponTableRow({ coupon }: { coupon: Coupon }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-bold text-sm uppercase">
            {coupon.code}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground hidden sm:table-cell">
          <Badge variant="outline" className="capitalize">
            {coupon.type}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground font-medium">
          {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
        </TableCell>
        <TableCell className="text-muted-foreground hidden lg:table-cell">
          {coupon.maxUses === -1 ? "Unlimited" : coupon.maxUses}
        </TableCell>
        <TableCell>
          <Badge
            variant={coupon.isActive ? "default" : "destructive"}
            className="font-medium"
          >
            {coupon.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground tabular-nums hidden md:table-cell">
          {coupon.expiryDate 
            ? new Date(coupon.expiryDate).toLocaleDateString(undefined, { dateStyle: "medium" })
            : "No Expiry"}
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
                    coupon "{coupon.code}" and remove it from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteCoupon(coupon._id)}
                  >
                    Delete Coupon
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>

      <CouponEditDialog
        coupon={coupon}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
