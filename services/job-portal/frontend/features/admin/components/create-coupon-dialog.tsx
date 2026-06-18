"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Asterisk } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  CouponFormValues,
  couponSchema,
} from "@/features/admin/validations/coupon.schema";
import { useCreateCoupon } from "@/features/admin/hooks/use-coupon";

interface CreateCouponDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateCouponDialog({
  children,
  open,
  onOpenChange,
}: CreateCouponDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) {
      resetForm();
    }
  };

  const { mutate: createCoupon, isPending } = useCreateCoupon(() => {
    handleOpenChange(false);
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const resetForm = () => {
    reset({
      code: "",
      type: "percentage",
      value: 0,
      isActive: true,
      expiryDate: undefined,
      maxUses: undefined,
    });
  };

  const onSubmit = (data: CouponFormValues) => {
    createCoupon(data);
  };

  const selectedType = watch("type");
  const isActive = watch("isActive");

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden px-4 pb-4 sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Create New Coupon
          </DialogTitle>
          <DialogDescription>
            Add a new discount coupon for the platform.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-1">
                  Coupon Code <Asterisk className="text-destructive size-3" />
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  type="text"
                  placeholder="e.g. SUMMER50"
                  className="uppercase"
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Discount Type <Asterisk className="text-destructive size-3" />
                </Label>
                <Select
                  onValueChange={(val: any) => setValue("type", val)}
                  defaultValue="percentage"
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
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center gap-1">
                  Discount Value {selectedType === "percentage" ? "(%)" : "($)"}{" "}
                  <Asterisk className="text-destructive size-3" />
                </Label>
                <Input
                  id="value"
                  {...register("value", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={selectedType === "percentage" ? 100 : undefined}
                  step={selectedType === "percentage" ? "1" : "0.01"}
                  placeholder="0"
                />
                {errors.value && (
                  <p className="text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">
                  Expiry Date{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="expiryDate"
                  {...register("expiryDate")}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">
                  Max Uses{" "}
                  <span className="font-normal text-gray-400">
                    (-1 for unlimited)
                  </span>
                </Label>
                <Input
                  id="maxUses"
                  {...register("maxUses", {
                    setValueAs: (v) =>
                      v === "" || v === null || Number.isNaN(Number(v))
                        ? undefined
                        : Number(v),
                  })}
                  type="number"
                  min={-1}
                  placeholder="Enter -1 for unlimited"
                />
                {errors.maxUses && (
                  <p className="text-sm text-red-600">
                    {errors.maxUses.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3 border-t pt-6">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Coupon
              </Label>
            </div>
          </div>

          <div className="bg-muted/20 mt-auto flex shrink-0 justify-end gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[150px] bg-[#2563eb] px-8 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
