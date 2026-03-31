"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CouponFormValues, couponSchema } from "../super-admin.schema";
import { useCreateCoupon } from "../hooks/use-create-coupon";

export default function CreateCouponForm() {
  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    watch,
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
    createCoupon(data);
  };

  const selectedType = watch("type");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin-dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Coupon</h1>
        <p className="text-gray-600 mt-2">
          Add a new discount coupon for the platform.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Coupon Code
              </label>
              <input
                {...register("code")}
                type="text"
                placeholder="e.g. SUMMER50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition uppercase"
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Discount Type
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Fixed Amount ($)</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Discount Value {selectedType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                {...register("value", { valueAsNumber: true })}
                type="number"
                min="0"
                step={selectedType === "percentage" ? "1" : "0.01"}
                max={selectedType === "percentage" ? "100" : undefined}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.value && (
                <p className="text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                {...register("expiryDate")}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Max Uses <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                {...register("maxUses", { valueAsNumber: true, setValueAs: (v) => v === "" || isNaN(Number(v)) ? undefined : Number(v) })}
                type="number"
                min="1"
                step="1"
                placeholder="Unlimited"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.maxUses && (
                <p className="text-sm text-red-600">{errors.maxUses.message}</p>
              )}
            </div>

            <div className="space-y-2 flex items-center pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Active Coupon
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer sm:w-auto flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
