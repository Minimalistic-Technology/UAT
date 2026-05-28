"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Import isolated components
import AdminPanel from "@/app/(dashboard)/dashboard/components/AdminPanel";
import UserStats from "@/app/(dashboard)/dashboard/components/UserStats";
import DashboardHeader from "@/app/(dashboard)/dashboard/components/DashboardHeader";

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#1877F2]" size={32} />
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      <DashboardHeader user={user} isAdmin={isAdmin} />

      {/* Strict Conditional Rendering to prevent logic overlap */}
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <UserStats />
      )}
    </div>
  );
};

export default DashboardPage;
