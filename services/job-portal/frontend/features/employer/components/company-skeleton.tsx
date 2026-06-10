import { Skeleton } from "@/components/ui/skeleton";

export const CompanyProfileSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Skeleton className="h-48 w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-[400px] w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[600px] w-full rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]" />
        </div>
      </div>
    </div>
  );
};
