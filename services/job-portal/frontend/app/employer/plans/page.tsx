"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Briefcase } from "lucide-react";
import { PlanCard } from "@/features/employer/components/plan-card";
import { CouponInput } from "@/features/employer/components/coupon-input";
import { useCoupon } from "@/features/employer/hooks/use-coupon";
import { Plan } from "@/features/employer/types";
import { getPlans } from "@/features/employer";

export default function PlansPage() {
  const {
    couponData,
    couponError,
    isLoading: isCouponLoading,
    handleApply,
    handleRemove,
    appliedCode,
  } = useCoupon();

  const {
    data: getAllPlansResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
  });

  const plans: Plan[] = getAllPlansResponse?.data?.plans ?? [];

  const sorted = [...plans].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return (
    <div className="min-h-screen bg-linear-to-t from-blue-200 via-gray-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto">
            Flexible pricing designed for startups to enterprises.
          </p>
        </div>

        {/* Coupon Section */}
        <div className="max-w-md mx-auto mb-10">
          <CouponInput
            appliedCoupon={appliedCode}
            onApply={handleApply}
            onRemove={handleRemove}
            isLoading={isCouponLoading}
          />
          {couponError && (
            <p className="text-xs text-red-500 mt-2 text-center font-medium">
              {couponError}
            </p>
          )}
        </div>

        {isError && (
          <Card className="text-center py-12 border border-red-200 bg-red-50 rounded-xl mb-8">
            <p className="text-sm font-semibold text-red-600 text-center w-full">Failed to load plans</p>
          </Card>
        )}

        <div className={`grid gap-8 ${
          sorted.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : 
          sorted.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" : 
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
          ) : sorted.length === 0 && !isError ? (
            <EmptyState />
          ) : (
            sorted.map((plan, i) => (
              <div key={plan._id} className="transform transition-all duration-300 hover:-translate-y-1">
                <PlanCard 
                  plan={plan} 
                  index={i} 
                  discountDetails={couponData} 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <Briefcase className="h-10 w-10 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900">No plans available</h3>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 p-6 space-y-4 bg-white">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-300 rounded" />
      <div className="h-10 w-full bg-gray-300 rounded-lg mt-4" />
    </div>
  );
}