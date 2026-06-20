import { Skeleton } from "@/components/ui/skeleton";

export const DashboardOverviewSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
};
