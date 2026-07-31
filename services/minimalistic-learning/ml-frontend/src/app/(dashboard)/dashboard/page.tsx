"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Import isolated components from new features architecture
import AdminPanel from "@/features/admin/components/AdminPanel";
import UserStats from "@/features/dashboard/components/UserStats";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#1877F2]" size={32} />
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <DashboardHeader user={user} isAdmin={isAdmin} />

      {/* Strict Conditional Rendering to prevent logic overlap */}
      {isAdmin ? <AdminPanel /> : <UserStats />}
    </div>
  );
};

export default DashboardPage;
