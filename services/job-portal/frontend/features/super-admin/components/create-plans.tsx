"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PlanFormValues, planSchema } from "../super-admin.schema";
import { useCreatePlan } from "../hooks/use-create-plan";

export default function CreatePlanForm() {
  const { mutate: createPlan, isPending } = useCreatePlan();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormValues>({
    // @ts-ignore
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "INR",
      durationDays: 30,
      jobPostLimit: -1,
      features: [""],
      isFeatured: false,
      isDefault: false,
      displayOrder: 0,
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore - useFieldArray prefers objects, but works with strings if registered correctly
    name: "features",
  });

  const onSubmit = (data: PlanFormValues) => {
    console.log("payload", data);
    createPlan(data);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Plan</h1>
        <p className="text-gray-600 mt-2">
          Add a new subscription plan for employers.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Plan Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Premium Plan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                {...register("displayOrder", { valueAsNumber: true })}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.displayOrder && (
                <p className="text-sm text-red-600">
                  {errors.displayOrder.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description{" "}
                <span className="text-gray-400 font-normal">
                  (optional, max 500 chars)
                </span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Briefly describe what this plan offers…"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition bg-white"
              >
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
              {errors.currency && (
                <p className="text-sm text-red-600">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Duration (Days)
              </label>
              <input
                {...register("durationDays", { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                placeholder="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.durationDays && (
                <p className="text-sm text-red-600">
                  {errors.durationDays.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Job Post Limit{" "}
                <span className="text-gray-400 font-normal">
                  (-1 = unlimited)
                </span>
              </label>
              <input
                {...register("jobPostLimit", { valueAsNumber: true })}
                type="number"
                min="-1"
                step="1"
                placeholder="-1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
              {errors.jobPostLimit && (
                <p className="text-sm text-red-600">
                  {errors.jobPostLimit.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {(
              [
                { field: "isActive", label: "Active Plan" },
                { field: "isFeatured", label: "Featured Plan" },
                { field: "isDefault", label: "Default Plan" },
              ] as const
            ).map(({ field, label }) => (
              <div key={field} className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(field)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Plan Features
              </label>
              <button
                type="button"
                // Force append an empty string to match z.string()
                onClick={() => append("" as any)}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        // Use direct index registration
                        {...register(`features.${index}`)}
                        type="text"
                        placeholder={`Feature ${index + 1}`}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden transition ${
                          errors.features?.[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>

                    {/* Only show remove button if there's more than one feature or based on your logic */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      aria-label="Remove feature"
                    >
                      <Trash2 className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>

                  {/* Improved error display */}
                  {errors.features?.[index] && (
                    <p className="text-xs text-red-600 ml-1">
                      {errors.features[index]?.message}
                    </p>
                  )}
                </div>
              ))}

              {/* Optional: Show global array errors (like min length) */}
              {errors.features && !Array.isArray(errors.features) && (
                <p className="text-sm text-red-600">
                  {(errors.features as any).message}
                </p>
              )}
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
                "Create Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
