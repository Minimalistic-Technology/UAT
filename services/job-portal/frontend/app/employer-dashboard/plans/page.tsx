"use client";

import { Briefcase, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plan } from "@/features/employer/types";
import { cn } from "@/lib/utils";
import { useGetPlans } from "@/features/employer/hooks/use-plans";
import { PlanCard } from "@/features/employer/components/plan-card";

export default function PlansPage() {
  const { data: plansResponse, isLoading, isError } = useGetPlans();

  const plans: Plan[] = plansResponse?.data.plans ?? [];

  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
        <p className="mt-2 text-gray-600">
          Choose the perfect plan to scale your hiring process.
        </p>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mx-auto max-w-2xl py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            We couldn't load the subscription plans. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Plans Grid */}
      <div
        className={cn(
          "grid justify-center gap-8",
          sortedPlans.length === 1
            ? "mx-auto max-w-md grid-cols-1"
            : sortedPlans.length === 2
              ? "mx-auto max-w-4xl grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
        ) : sortedPlans.length === 0 && !isError ? (
          <EmptyState />
        ) : (
          sortedPlans.map((plan) => (
            <div
              key={plan._id}
              className="transition-all duration-300 hover:scale-[1.02]"
            >
              <PlanCard plan={plan} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full border-dashed bg-transparent py-20">
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <Briefcase className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <CardTitle>No plans available</CardTitle>
          <CardDescription>
            There are currently no active subscription plans. Check back later.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanSkeleton() {
  return (
    <Card className="flex h-112.5 flex-col">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}
