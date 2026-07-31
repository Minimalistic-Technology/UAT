import { Suspense } from "react";
import ForgotPasswordClient from "./forgot-password-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordPageSkeleton />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}

const ForgotPasswordPageSkeleton = () => {
  return (
    <div className="flex h-[calc(100dvh-72px)] w-full overflow-hidden bg-slate-50/50">
      <div className="hidden h-full w-1/2 lg:block">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-card w-full max-w-sm space-y-6 rounded-xl border-none p-6 shadow-lg sm:border">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto h-4 w-full" />
          </div>
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="mt-4 h-10 w-full" />
            <div className="mt-6 flex justify-center">
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
