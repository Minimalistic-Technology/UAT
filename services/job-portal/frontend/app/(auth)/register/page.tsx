import { Suspense } from 'react';
import RegisterClient from './register-client';
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterClient />
    </Suspense>
  );
}

const RegisterPageSkeleton = () => {
  return (
    <div className="flex h-[calc(100dvh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden lg:block h-full w-1/2">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm border-none sm:border shadow-lg bg-card rounded-xl p-6 space-y-6">
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
          </div>
          <div className="space-y-4 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
            <div className="flex justify-center mt-6">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};