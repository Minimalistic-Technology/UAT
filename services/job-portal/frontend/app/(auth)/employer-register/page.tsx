import { Suspense } from "react";
import RegisterEmployerClient from "./register-employer-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterPage() {
  return (
    <Suspense fallback={<EmployerRegisterPageSkeleton />}>
      <RegisterEmployerClient />
    </Suspense>
  );
}

const EmployerRegisterPageSkeleton = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      <div className="hidden h-full w-1/2 lg:block">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-card w-full max-w-sm space-y-6 rounded-xl border-none p-6 shadow-lg sm:border">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-8 w-5/6" />
            <Skeleton className="mx-auto h-4 w-3/4" />
          </div>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-3 w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-3 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <Skeleton className="h-10 w-full" />
            <div className="mt-4 flex justify-center">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
