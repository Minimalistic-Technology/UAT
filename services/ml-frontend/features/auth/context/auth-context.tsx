"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth-service";
import { LoginResponse } from "../types/auth-response";
import { useRouter } from "next/navigation";

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

  // The cookie-based session is managed automatically by the browser.
  // We just attempt to fetch the current user profile on mount.
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authService.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = data?.data?.user || null;
  const isAuthenticated = !!user;

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Failed to logout securely on backend:", error);
    } finally {
      queryClient.setQueryData(["auth-me"], null);
      router.push("/");
      router.refresh();
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
