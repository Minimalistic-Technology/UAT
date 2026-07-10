import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanSkeleton() {
  return (
    <Card className="relative flex h-full min-h-[40rem] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm dark:bg-card">
      <CardHeader className="px-8 pt-10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-1.5 py-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="mt-6 flex flex-col pt-2">
          <Skeleton className="h-12 w-2/3" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </li>
          <li className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-4/6" />
          </li>
          <li className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-full" />
          </li>
          <li className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </li>
          <li className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </li>
        </ul>
      </CardContent>
      <CardFooter className="px-8 pb-10">
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}
