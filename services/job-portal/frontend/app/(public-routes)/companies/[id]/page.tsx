"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetCompanyById, useGetCompanyJobs } from "@/hooks/use-companies";
import JobCard from "@/components/job-card";
import { Building2, Globe, MapPin, Users, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const { data: companyRes, isLoading: isLoadingCompany, error: companyError } = useGetCompanyById(companyId);
  const { data: jobsRes, isLoading: isLoadingJobs } = useGetCompanyJobs(companyId);

  const company = companyRes?.data;
  const jobs = jobsRes?.data?.jobs || [];

  if (isLoadingCompany) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Company not found</h2>
        <p className="text-muted-foreground">The company you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Hero Section */}
      <Card className="mb-8 overflow-hidden border-none shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 md:h-48" />
        <CardContent className="relative px-6 pb-8 pt-0 sm:px-8">
          <div className="-mt-16 mb-6 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <Avatar className="h-32 w-32 rounded-xl border-4 border-background bg-muted shadow-md">
                <AvatarImage src={company.logo?.url} alt={company.name} className="object-cover" />
                <AvatarFallback className="rounded-xl text-4xl">
                  <Building2 className="h-12 w-12 opacity-50" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {company.industry && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {company.industry}
                    </div>
                  )}
                  {company.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {company.location.city}, {company.location.country}
                    </div>
                  )}
                  {company.companySize && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {company.companySize}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {company.website && (
              <Button asChild className="shrink-0 shadow-sm" variant="outline">
                <Link href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="mb-4 text-xl font-semibold">About Us</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {company.description ? (
                    <p className="whitespace-pre-line">{company.description}</p>
                  ) : (
                    <p className="italic">No description provided.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-muted/30 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">Open Positions</span>
                    <span className="font-semibold text-foreground">{company.activeJobs || 0}</span>
                  </div>
                  {company.industry && (
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium text-right">{company.industry}</span>
                    </div>
                  )}
                  {company.companySize && (
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Company Size</span>
                      <span className="font-medium text-right">{company.companySize}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions Section */}
      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Open Positions</h2>
          {jobs.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20">
              {jobs.length} Job{jobs.length === 1 ? "" : "s"}
            </Badge>
          )}
        </div>

        {isLoadingJobs ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-muted-foreground">
            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No open positions</h3>
            <p className="text-sm">This company doesn't have any open positions at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}