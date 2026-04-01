"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { PlanCard } from "@/features/employer/components/plan-card";
import { getPlans } from "@/features/employer";
import { Plan } from "@/features/employer/types";

export default function PlansPage() {
  const {
    data: getAllPlansResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
  });

  const plans: Plan[] = getAllPlansResponse?.data?.plans ?? [];

  // Sort: featured first, then by displayOrder
  const sorted = [...plans].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.displayOrder - b.displayOrder;
  });

  return (
    <div className="min-h-screen bg-linear-to-t from-blue-200 via-gray-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Flexible pricing designed for startups to enterprises. Upgrade
            anytime as your hiring grows.
          </p>
        </div>

        {/* Error */}
        {isError && (
          <Card className="text-center py-12 border border-red-200 bg-red-50 rounded-xl">
            <p className="text-sm font-semibold text-red-600">
              Failed to load plans
            </p>
            <p className="text-xs text-red-400 mt-1">
              Try refreshing or check your connection
            </p>
          </Card>
        )}

        {/* Grid */}
        <div
          className={`grid gap-8 ${
            sorted.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : sorted.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
          ) : sorted.length === 0 && !isError ? (
            <EmptyState />
          ) : (
            sorted.map((plan, i) => (
              <div
                key={plan._id}
                className="transform transition-all duration-300 hover:-translate-y-1"
              >
                <PlanCard plan={plan} index={i} />
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        {!isLoading && sorted.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-10">
            All prices are inclusive of applicable taxes. Contact support for
            custom enterprise plans.
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="p-6 bg-gray-100 rounded-full mb-6">
        <Briefcase className="h-10 w-10 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No plans available
      </h3>

      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
        We’re currently updating our pricing plans. Please check back shortly.
      </p>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 p-6 space-y-4 bg-white">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-300 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />

      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-3/5 bg-gray-200 rounded" />
      </div>

      <div className="h-10 w-full bg-gray-300 rounded-lg mt-4" />
    </div>
  );
}
