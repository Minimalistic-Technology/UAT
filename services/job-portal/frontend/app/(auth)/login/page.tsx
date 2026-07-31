import { Suspense } from "react";
import LoginClient from "./login-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginClient />
    </Suspense>
  );
}

const LoginPageSkeleton = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="mt-4 h-10 w-full" />
            <div className="flex items-center justify-center py-2">
              <Skeleton className="h-[1px] w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="mt-6 flex justify-center">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
