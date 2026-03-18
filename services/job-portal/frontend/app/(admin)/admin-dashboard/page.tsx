"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { GlobalRole } from "@/types";
import { useEffect, useState } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import UserManagementTab from "@/app/pages/admin/userManagementTab";
import PendingJobsTab from "@/app/pages/admin/pendingJobsTab";
import AnalyticsTab from "@/app/pages/admin/analyticsTab";
import { Card } from "@/components/ui/Card";
import { Briefcase, FileText, Users, Plus } from "lucide-react";
import { StatusCard } from "@/components/ui/StatusCard";
import { RegisterCompanyModel } from "@/components/models";
import { useQueryClient } from "@tanstack/react-query";
import { KycApplicationsTab } from "@/features/super-admin";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState<
    "users" | "analytics" | "jobs" | "kyc applications"
  >("users");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isAdmin = session?.user?.role === GlobalRole.SUPER_ADMIN;
  const admin = useAdminDashboard(status === "authenticated" && isAdmin);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      redirect("/login");
    }
  }, [status, isAdmin]);

  if (status === "loading") return <div>Loading...</div>;
  if (!isAdmin) return null;

  const { stats } = admin;

  const totalUsers = Number(stats.data?.data.totalUsers) - 1 || 0;
  const totalJobs = Number(stats.data?.data.totalJobs) || 0;
  const totalCompanies = Number(stats.data?.data.totalCompanies) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage platform users, jobs, and analytics
          </p>
        </div>
        <button
          className="cursor-pointer group relative flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-800 hover:shadow-md active:scale-95"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Register New Company</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatusCard
          icon={<Users className="w-12 h-12 text-blue-200" />}
          label="Total Users"
          value={totalUsers}
          gradient="bg-linear-to-br from-blue-500 to-blue-600"
        />

        <StatusCard
          icon={<Briefcase className="w-12 h-12 text-green-200" />}
          label="Total Jobs"
          value={totalJobs}
          gradient="bg-linear-to-br from-green-500 to-green-600"
        />

        <StatusCard
          icon={<FileText className="w-12 h-12 text-purple-200" />}
          label="Total Companies"
          value={totalCompanies}
          gradient="bg-linear-to-br from-purple-500 to-purple-600"
        />

        {/* <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Pending Jobs</p>
              <p className="text-3xl font-bold">
                {pendingJobs?.data?.length || 0}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-200" />
          </div>
        </Card> */}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab("users")}
              className={`${
                selectedTab === "users"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users Management
            </button>
            <button
              onClick={() => setSelectedTab("jobs")}
              className={`${
                selectedTab === "jobs"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Jobs
            </button>
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`${
                selectedTab === "analytics"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Analytics
            </button>
            <button
              onClick={() => setSelectedTab("kyc applications")}
              className={`${
                selectedTab === "kyc applications"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              KYC Applications
            </button>
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {selectedTab === "users" && <UserManagementTab />}

      {/* Pending Jobs Tab */}
      {selectedTab === "jobs" && <PendingJobsTab />}

      {/* Analytics Tab */}
      {selectedTab === "analytics" && (
        <AnalyticsTab
          // we only render the tab once stats are available; fall back to an empty object
          stats={
            stats.data?.data ?? {
              totalUsers: 0,
              totalJobs: 0,
              totalCompanies: 0,
            }
          }
        />
      )}

      {/* KYC Applications Tab */}
      {selectedTab === "kyc applications" && <KycApplicationsTab />}

      <RegisterCompanyModel
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          // invalidate the admin stats so they refresh when a company is created

          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin-pending-jobs"] });
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        }}
      />
    </div>
  );
}
