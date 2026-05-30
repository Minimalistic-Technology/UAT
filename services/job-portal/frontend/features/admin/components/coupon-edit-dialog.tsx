"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  CouponFormValues,
  couponSchema,
} from "@/features/admin/validations/coupon.schema";
import { useUpdateCoupon } from "@/features/admin/hooks/use-coupon";
import { Coupon } from "@/types/new-index";

interface CouponEditDialogProps {
  coupon: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponEditDialog({ coupon, open, onOpenChange }: CouponEditDialogProps) {
  const { mutate: updateCoupon, isPending } = useUpdateCoupon();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      isActive: true,
      expiryDate: undefined,
      maxUses: undefined,
    },
  });

  useEffect(() => {
    if (coupon && open) {
      reset({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : undefined,
        maxUses: coupon.maxUses,
      });
    }
  }, [coupon, open, reset]);

  const onSubmit = (data: CouponFormValues) => {
    if (!coupon?._id) return;
    updateCoupon(
      { id: coupon._id, data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const selectedType = watch("type");
  const isActive = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Coupon</DialogTitle>
          <DialogDescription>
            Update discount type, value, and limits for this coupon.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <form id="coupon-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Coupon Code</Label>
                <Input
                  id="edit-code"
                  {...register("code")}
                  type="text"
                  placeholder="e.g. SUMMER50"
                  className="uppercase"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  onValueChange={(val: any) => setValue("type", val)}
                  value={selectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-value">
                  Discount Value {selectedType === "percentage" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="edit-value"
                  {...register("value", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step={selectedType === "percentage" ? "1" : "0.01"}
                  placeholder="0"
                />
                {errors.value && (
                  <p className="text-sm text-destructive">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiryDate">
                  Expiry Date{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="edit-expiryDate"
                  {...register("expiryDate")}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-maxUses">
                  Max Uses{" "}
                  <span className="font-normal text-muted-foreground">
                    (-1 for unlimited)
                  </span>
                </Label>
                <Input
                  id="edit-maxUses"
                  {...register("maxUses", {
                    valueAsNumber: true,
                    setValueAs: (v) =>
                      v === "" || v === null || isNaN(v) ? undefined : Number(v),
                  })}
                  type="number"
                  placeholder="Enter -1 for unlimited"
                />
                {errors.maxUses && (
                  <p className="text-sm text-destructive">{errors.maxUses.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <Switch
                  id="edit-isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="edit-isActive">Active Coupon</Label>
              </div>
            </div>
          </form>
        </ScrollArea>
        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="coupon-edit-form"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
