"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CouponFormValues,
  couponSchema,
} from "@/features/admin/validations/coupon.schema";
import { useCreateCoupon } from "@/features/admin/hooks/use-coupon";

export default function CreateCouponForm() {
  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const onSubmit = (data: CouponFormValues) => {
    console.log("formdata", data);
    createCoupon(data);
  };

  const selectedType = watch("type");
  const isActive = watch("isActive");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Coupon</h1>
        <p className="mt-2 text-gray-600">
          Add a new discount coupon for the platform.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
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
              <Label>Discount Type</Label>
              <Select
                onValueChange={(val: any) => setValue("type", val)}
                defaultValue="percentage"
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
              <Label htmlFor="value">
                Discount Value {selectedType === "percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                id="value"
                {...register("value", { valueAsNumber: true })}
                type="number"
                min="0"
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
                  valueAsNumber: true,
                  setValueAs: (v) =>
                    v === "" || v === null ? undefined : Number(v),
                })}
                type="number"
                // Removed min="1" to allow -1
                placeholder="Enter -1 for unlimited"
              />
              {errors.maxUses && (
                <p className="text-sm text-red-600">{errors.maxUses.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-8">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Active Coupon</Label>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
