"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Coupon } from "@/types/new-index"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useDeleteCoupon } from "@/features/admin/hooks/use-coupon"
import { CouponEditDialog } from "./coupon-edit-dialog"
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

const ActionCell = ({ coupon }: { coupon: Coupon }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

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
                  coupon "{coupon.code}" and remove it from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <AlertDialogCancel className="mt-0 rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-sm font-semibold"
                onClick={() => deleteCoupon(coupon._id)}
              >
                Delete Coupon
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CouponEditDialog
        coupon={coupon}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
};

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => {
      return (
        <div className="font-bold text-sm uppercase">
          {row.original.code}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="hidden sm:block">Type</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden sm:block">
          <Badge variant="outline" className="capitalize">
            {row.original.type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <div className="text-muted-foreground font-medium">
          {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
        </div>
      );
    },
  },
  {
    accessorKey: "maxUses",
    header: () => <div className="hidden lg:block">Max Uses</div>,
    cell: ({ row }) => {
      const maxUses = row.original.maxUses;
      return (
        <div className="text-muted-foreground hidden lg:block">
          {maxUses === -1 ? "Unlimited" : maxUses}
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
    accessorKey: "expiry",
    header: () => <div className="hidden md:block">Expiry Date</div>,
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      return (
        <div className="text-muted-foreground tabular-nums hidden md:block">
          {expiryDate
            ? new Date(Number(expiryDate)).toLocaleDateString(undefined, { dateStyle: "medium" })
            : "No Expiry"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return <ActionCell coupon={row.original} />;
    },
  },
]
