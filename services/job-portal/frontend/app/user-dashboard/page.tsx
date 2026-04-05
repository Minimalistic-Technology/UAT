"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  TrendingUp,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { ApplicationStatus } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// hooks
import { useGetJobs } from "@/features/user/hooks/use-job";
import { useGetMyApplications } from "@/features/user/hooks/use-job-application";
import { StatCard } from "@/features/employer/components/employer-stats-card";

export default function JobSeekerDashboard() {
  const { data: session, status: authStatus } = useSession();
  const { data: applications, isLoading: applicationLoading } =
    useGetMyApplications();
  const { data: recommendedJobs, isLoading: jobsLoading } = useGetJobs({
    limit: 5,
  });

  if (authStatus === "loading" || applicationLoading)
    return <DashboardSkeleton />;

  const stats = [
    {
      label: "Total Applied",
      value: applications?.data.count || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending",
      value:
        applications?.data.applications.filter(
          (app) => app.status === ApplicationStatus.PENDING,
        ).length || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Shortlisted",
      value:
        applications?.data.applications.filter(
          (app) => app.status === ApplicationStatus.SHORTLISTED,
        ).length || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Rejected",
      value:
        applications?.data.applications.filter(
          (app) => app.status === ApplicationStatus.REJECTED,
        ).length || 0,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="animate-in fade-in container mx-auto space-y-8 p-6 duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {session?.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            You have applied to{" "}
            <span className="font-medium text-slate-900">
              {stats[0].value} jobs
            </span>{" "}
            so far.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/profile/resume">
              <FileText className="mr-2 h-4 w-4" /> My Resume
            </Link>
          </Button>
          <Button asChild>
            <Link href="/find-jobs">
              <Search className="mr-2 h-4 w-4" /> Browse Jobs
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            // We'll make the first card (Total Applied) the Primary one
            isPrimary={index === 0}
            // You can pass dynamic descriptions based on the stat type
            description={
              stat.label === "Pending"
                ? "Awaiting recruiter review"
                : stat.label === "Shortlisted"
                  ? "Ready for interview"
                  : "Updated recently"
            }
            // Custom icon colors for non-primary cards
            iconClassName={!(index === 0) ? stat.color : ""}
            className="border-none shadow-sm transition-shadow duration-200 hover:shadow-md"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content: Recent Applications */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Status updates for your latest submissions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-primary hover:text-primary hover:bg-primary/5"
              >
                <Link href="/user-dashboard/applications">
                  View All <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications?.data.applications.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed py-12 text-center">
                    <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p className="text-slate-500">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button variant="link" asChild>
                      <Link href="/jobs">Start searching</Link>
                    </Button>
                  </div>
                ) : (
                  applications?.data.applications.slice(0, 4).map((app) => (
                    <div
                      key={app._id}
                      className="group bg-card hover:border-primary/30 flex items-center justify-between rounded-xl border p-4 transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <h4 className="group-hover:text-primary font-semibold text-slate-900 transition-colors">
                          {app.job.title}
                        </h4>
                        <div className="text-muted-foreground flex items-center gap-3 text-sm">
                          <span>{app.job.company.name}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span>
                            Applied{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            app.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="px-3 py-1 font-medium capitalize"
                        >
                          {app.status.toLowerCase().replace("_", " ")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          asChild
                        >
                          <Link href={`/applications/${app._id}`}>
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Components */}
        <div className="space-y-6 lg:col-span-4">
          {/* Profile Card */}
          <Card className="relative overflow-hidden border-none bg-slate-900 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Profile Strength</CardTitle>
              <CardDescription className="text-slate-400">
                Complete your profile to get 3x more views
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-bold">75%</span>
                </div>
                <Progress
                  value={75}
                  className="h-2 bg-slate-700"
                  //   indicatorClassName="bg-primary"
                />
              </div>
              <Button
                className="w-full bg-white text-slate-900 hover:bg-slate-100"
                asChild
              >
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80 px-6">
                <div className="space-y-6 pb-6">
                  {recommendedJobs?.data?.jobs?.map((job) => (
                    <Link
                      key={job._id}
                      href={`/jobs/${job._id}`}
                      className="group block"
                    >
                      <div className="space-y-1">
                        <h4 className="group-hover:text-primary text-sm font-semibold transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {job.company?.name}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge
                            variant="outline"
                            className="px-2 text-[10px] font-normal"
                          >
                            {job.jobType.replace("_", " ")}
                          </Badge>
                          <span className="flex items-center text-[10px] text-slate-400">
                            <MapPin className="mr-0.5 h-3 w-3" />{" "}
                            {job.location.city}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto space-y-8 p-10">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-75" />
        <Skeleton className="h-10 w-37.5" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <Skeleton className="h-125 rounded-xl lg:col-span-8" />
        <Skeleton className="h-125 rounded-xl lg:col-span-4" />
      </div>
    </div>
  );
}
