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
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50/50">
      <div className="hidden lg:block h-full w-1/2">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex-1 flex items-center justify-center h-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm border-none sm:border shadow-lg bg-card rounded-xl p-6 space-y-6">
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
          </div>
          <div className="space-y-4 mt-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
            <div className="flex justify-center items-center py-2">
              <Skeleton className="h-[1px] w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-center mt-6">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
