"use client";

import { useSession } from "next-auth/react";
import { Briefcase, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// hooks
import { useGetJobs } from "@/features/user/hooks/use-job";
import {
  useGetMyApplications,
  useGetMyApplicationStats,
} from "@/features/user/hooks/use-job-application";

// global components
import { AdminStatusCard } from "@/features/admin/components/stats-card";
import { UserProfileCard } from "@/features/user/components/profile/user-profile-card";

// local components
import { UserWelcomeHeader } from "@/features/user/components/dashboard/user-welcome-header";
import { RecentApplicationsCard } from "@/features/user/components/dashboard/recent-applications-card";
import { RecommendedJobsCard } from "@/features/user/components/dashboard/recommended-jobs-card";
import { useGetUserDetails } from "@/features/user/hooks/use-user";

export default function JobSeekerDashboard() {
  const { data: session, status: authStatus } = useSession();
  const userId = session?.user?.id;

  const { data: applications, isLoading: applicationLoading } =
    useGetMyApplications();
  const { data: responseData, isLoading: statsLoading } =
    useGetMyApplicationStats();
  const { data: recommendedJobs, isLoading: jobsLoading } = useGetJobs({
    limit: 5,
  });
  const { data: userData } = useGetUserDetails(userId);

  if (authStatus === "loading" || applicationLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  const user = userData?.data;
  const statsData = responseData?.data;

  // Profile strength logic ported for immediate dashboard view
  let profileStrength = 0;
  if (user) {
    if (user.firstName && user.lastName) profileStrength += 15;
    if (user.email) profileStrength += 10;
    if (user.phone) profileStrength += 15;
    if (user.location?.city || user.location?.country) profileStrength += 10;
    if (user.skills && user.skills.length > 0) profileStrength += 15;
    if (user.experiences && user.experiences.length > 0) profileStrength += 15;
    if (user.educations && user.educations.length > 0) profileStrength += 10;
    if (user.resume?.originalName) profileStrength += 10;
  }

  const stats = [
    {
      label: "Total Applied",
      value: statsData?.total || 0,
      icon: <Briefcase />,
      variant: "default" as const,
    },
    {
      label: "Pending",
      value: statsData?.byStatus?.pending || 0,
      icon: <Clock />,
      variant: "warning" as const,
    },
    {
      label: "Selected / Shortlisted",
      value:
        (statsData?.byStatus?.shortlisted || 0) +
        (statsData?.byStatus?.accepted || 0),
      icon: <CheckCircle className="text-success" />,
      variant: "success" as const,
    },
    {
      label: "Rejected",
      value: statsData?.byStatus?.rejected || 0,
      icon: <XCircle className="text-destructive" />,
      variant: "default" as const,
    },
  ];

  return (
    <div className="animate-in fade-in w-full space-y-6 duration-500 md:space-y-8">
      {/* Welcome Header */}
      <UserWelcomeHeader
        userName={session?.user?.name?.split(" ")[0] || "Guest"}
        totalApplied={statsData?.total || 0}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatusCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
            className="border-none shadow-sm transition-shadow duration-200 hover:shadow-md"
          />
        ))}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Main Content: Recent Applications */}
        <div className="space-y-6 lg:col-span-8">
          <RecentApplicationsCard
            applications={applications?.data?.applications || []}
          />
        </div>

        {/* Sidebar Components */}
        <div className="space-y-6 self-stretch lg:col-span-4">
          <UserProfileCard
            firstName={
              user?.firstName || session?.user?.name?.split(" ")[0] || ""
            }
            lastName={
              user?.lastName ||
              session?.user?.name?.split(" ").slice(1).join(" ") ||
              ""
            }
            email={user?.email || session?.user?.email || ""}
            avatarUrl={
              typeof user?.avatar === "string"
                ? user.avatar
                : user?.avatar?.url || ""
            }
            profileStrength={profileStrength}
          />
          <RecommendedJobsCard jobs={recommendedJobs?.data?.jobs || []} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}
