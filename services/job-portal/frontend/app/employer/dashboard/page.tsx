"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { jobService } from "@/lib/services/job.service";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { JobStatus, GlobalRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  _id: string;
  title: string;
  status: JobStatus;
  location: { city: string; country: string };
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "green" | "blue" | "purple" | "orange";
}

interface JobStatusSelectProps {
  jobId: string;
  currentStatus: JobStatus;
  onChange: (jobId: string, status: string) => void;
  isPending: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  [JobStatus.ACTIVE]: "bg-emerald-50 text-emerald-800 border-emerald-200",
  [JobStatus.CLOSED]: "bg-red-50 text-red-800 border-red-200",
  [JobStatus.DRAFT]: "bg-gray-50 text-gray-700 border-gray-200",
};

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  green: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
  purple: "text-purple-600 bg-purple-50",
  orange: "text-orange-600 bg-orange-50",
};

function StatCard({ icon, label, value, accent = "blue" }: StatCardProps) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${ACCENT_STYLES[accent]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
      </div>
    </Card>
  );
}

function JobStatusSelect({
  jobId,
  currentStatus,
  onChange,
  isPending,
}: JobStatusSelectProps) {
  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => onChange(jobId, e.target.value)}
      className={`
        block w-full px-3 py-1.5 text-sm rounded-md border shadow-sm
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${STATUS_STYLES[currentStatus] ?? STATUS_STYLES[JobStatus.DRAFT]}
      `}
    >
      <option value={JobStatus.ACTIVE}>Active</option>
      <option value={JobStatus.CLOSED}>Closed</option>
    </select>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No jobs posted yet
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Get started by creating your first job listing.
          </p>
          <Link href="/employer/jobs/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Post Your First Job
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    </div>
  );
}

function JobRow({
  job,
  onStatusChange,
  isPending,
}: {
  job: any; // add the proper type in the later future
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}) {
  const queryClient = useQueryClient();

  const deleteJobMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => jobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Job status updated");
    },
    onError: (error) => {
      toast.error("Failed to delete job");
      console.error(error);
    },
  });

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {job.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {job.location.city}, {job.location.country}
        </p>
      </td>
      <td className="px-6 py-4">
        <JobStatusSelect
          jobId={job._id}
          currentStatus={job.status}
          onChange={onStatusChange}
          isPending={isPending}
        />
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 text-center">
        {job.applicationsCount}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 text-center">
        {job.viewsCount}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
        {new Date(job.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/employer/jobs/${job._id}/edit`}>
            <Button variant="ghost" size="sm" aria-label="Edit job">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Delete job"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => deleteJobMutation.mutate({ id: job._id })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function OwnerDashboardControls() {
  const controls = [
    // {
    //   title: "View All Company Jobs",
    //   path: "/employer/jobs/all",
    //   description: "Audit every listing posted by the team.",
    // },
    {
      title: "Manage Team Access",
      path: "/employer/team",
      description: "Control who can post or edit jobs.",
    },
    {
      title: "Company Settings",
      path: "/employer/settings",
      description: "Update your brand and public profile.",
    },
    {
      title: "View Applications",
      path: "/employer/applications",
      description: "View all applications received for your jobs.",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {controls.map((item) => (
        <Card key={item.path} className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {item.description}
            </p>
          </div>
          <Link href={item.path}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}

export default function EmployerDashboard() {
  const queryClient = useQueryClient();
  const { user, data: session, status } = useAuth();
  console.log("user", user);

  const { data: jobs } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => jobService.getMyJobs(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      jobService.updateJob(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Job status updated");
    },
    onError: (error) => {
      toast.error("Failed to update job status");
      console.error(error);
    },
  });

  const handleStatusChange = (jobId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: jobId, status: newStatus });
  };

  if (status === "loading") return <LoadingScreen />;

  if (!session || user?.role === GlobalRole.SUPER_ADMIN) redirect("/login");
  if (user && !user.isEmployee) redirect("/login");

  const jobList = jobs?.data ?? [];
  const activeJobs = jobList.filter(
    (j) => j.status === JobStatus.ACTIVE,
  ).length;
  const totalApplications = jobList.reduce(
    (sum, j) => sum + j.applicationsCount,
    0,
  );
  const totalViews = jobList.reduce((sum, j) => sum + j.viewsCount, 0);

  const stats: StatCardProps[] = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Active Jobs",
      value: activeJobs,
      accent: "green",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Total Jobs",
      value: jobList.length,
      accent: "blue",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Applications",
      value: totalApplications,
      accent: "purple",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Total Views",
      value: totalViews,
      accent: "orange",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employer Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your job postings and candidates
          </p>
        </div>
        <Link href="/employer/jobs/new">
          <Button className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {user?.companyRole === "owner" && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Administrative Controls
          </h2>
          <OwnerDashboardControls />
        </section>
      )}

      {/* Jobs Table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Your Job Postings
          </h2>
          <Link href="/employer/jobs/new">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Job
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Job Title",
                  "Status",
                  "Applications",
                  "Views",
                  "Posted",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobList.length === 0 ? (
                <EmptyState />
              ) : (
                jobList.map((job) => (
                  <JobRow
                    key={job._id}
                    job={job}
                    onStatusChange={handleStatusChange}
                    isPending={updateStatusMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
