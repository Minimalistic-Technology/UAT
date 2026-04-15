"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register", "/auth/verify-otp"];

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        let isValid = false;

        if (accessToken) {
          try {
            const payloadStr = atob(accessToken.split(".")[1]);
            const payload = JSON.parse(payloadStr);
            if (payload.exp && payload.exp * 1000 > Date.now()) {
              isValid = true;
            }
          } catch (e) {
            isValid = false;
          }
        }

        if (isValid) {
          if (isPublicRoute) {
            router.push("/");
          } else {
            setIsChecking(false);
          }
        } else if (refreshToken) {
          if (!isPublicRoute) {
            try {
              const res = await authService.refreshAccessToken(refreshToken);
              localStorage.setItem("accessToken", res.accessToken);
              localStorage.setItem("refreshToken", res.refreshToken);
              setIsChecking(false);
            } catch (error) {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.push("/auth/login");
            }
          } else {
            setIsChecking(false);
          }
        } else {
          if (!isPublicRoute) {
            router.push("/auth/login");
          } else {
            setIsChecking(false);
          }
        }
      } catch (error) {
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push("/auth/login");
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" enableSystem={true}>
        <Toaster position="top-right" />
        {isChecking ? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
