"use client";

import Link from "next/link";
import { Plus, Users, Briefcase, CreditCard, ArrowUpRight, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { StatCard } from "@/features/employer/components/employer-stats-card";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";

const Page = () => {
  const {data: responseData, isLoading, isError} = useGetMyCompanyDetails();

  const companyDetails = responseData?.data;
  const isUnverified = !isLoading && companyDetails && companyDetails.isVerified === false;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Employer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your active listings and candidate pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/employer-dashboard/plans">
              <CreditCard className="mr-2 h-4 w-4" />
              Plans
            </Link>
          </Button>

          <Button variant="default" asChild>
            <Link href="/employer-dashboard/jobs/create">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>
      </div>

      {isUnverified && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
          <AlertCircle className="h-5 w-5 !text-amber-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
            <div>
              <AlertTitle className="font-bold text-amber-800">Action Required: Verify Your Business</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your account is currently unverified. To post jobs and view full applicant profiles, please complete your KYC verification.
              </AlertDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900 shrink-0"
              asChild
            >
              <Link href="/employer-dashboard/settings/verify">
                Complete KYC
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Jobs"
          value="12"
          icon={Briefcase}
          description="+2 from last month"
        />

        <StatCard
          title="Total Applicants"
          value="248"
          icon={Users}
          description="+43 new this week"
        />

        <StatCard
          isPrimary
          title="Current Plan"
          value="Pro Plan"
          icon={ArrowUpRight}
          description={
            <Link href="/employer/plans" className="hover:underline">
              Upgrade subscription
            </Link>
          }
        />
      </div>

      {/* Placeholder for Recent Activity or Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            You have 12 unreviewed applications across all jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-50 items-center justify-center rounded-md border-2 border-dashed">
          <Button variant="ghost" asChild>
            <Link href="/employer-dashboard/applications">View All Applications</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
