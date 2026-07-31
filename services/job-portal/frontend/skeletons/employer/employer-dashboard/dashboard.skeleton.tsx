import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const DashboardOverviewSkeleton = () => {
  return (
    <div className="text-foreground flex w-full flex-col">
      {/* Header Section Skeleton */}
      <div className="mb-4 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-9 w-48 rounded-lg sm:w-[250px]" />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      <div className="mb-8 space-y-4"></div>

      {/* Quick Stats Grid Skeleton */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="border-secondary/20 bg-card relative overflow-hidden rounded-xl border transition-all duration-200"
          >
            <CardContent className="flex h-full flex-col justify-between gap-3 p-4 sm:p-5">
              <div className="flex w-full items-start justify-between">
                <Skeleton className="size-9 rounded-md" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Skeleton className="h-[18px] w-20 rounded-md" />
                <Skeleton className="h-[28px] w-16 rounded-md sm:h-[32px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
