import { Skeleton } from "@/components/ui/skeleton";

export const CompanyProfileSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
