import { Skeleton } from "@/components/ui/skeleton";

export const RecentApplicationsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl opacity-50" />
      ))}
    </div>
  );
};
