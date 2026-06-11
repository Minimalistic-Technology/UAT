import { Suspense } from 'react';
import RegisterEmployerClient from './register-employer-client';
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
      <div className="hidden lg:block h-full w-1/2">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm border-none sm:border shadow-lg bg-card rounded-xl p-6 space-y-6">
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-5/6 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
          <div className="space-y-6 mt-6">
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
            <div className="flex justify-center mt-4">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};