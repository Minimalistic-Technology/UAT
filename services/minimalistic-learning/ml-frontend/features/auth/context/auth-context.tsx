"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth-service";
import { LoginResponse } from "../types/auth-response";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: LoginResponse["data"]["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authService.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000,  // 5 minutes — prevent constant refetching
    gcTime: 10 * 60 * 1000,    // keep cache for 10 minutes
  });

  const user = data?.data?.user || null;
  const isAuthenticated = !!user;

  // React Client-side Route Protection (Replaces Next.js Edge Middleware for Static Export)
  useEffect(() => {
    if (isLoading || !isFetched) return; // wait until auth status is fully known

    const PROTECTED_ROUTES = ['/dashboard', '/my-blogs', '/blog/create', '/blog/edit'];
    const AUTH_ROUTES = ['/login', '/register', '/verify-otp'];

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthRoute && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isFetched, isAuthenticated, pathname, router]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Backend logout failed, but clearing local session anyway:", error);
    } finally {
      queryClient.setQueryData(["auth-me"], null);
      queryClient.clear();
      // Use hard navigation to cross layout boundary (dashboard → auth layout)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const refreshUser = () => {
    refetch();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
