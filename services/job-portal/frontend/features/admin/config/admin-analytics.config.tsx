import React from "react";
import { Briefcase, Building, FileText, ShieldCheck } from "lucide-react";

export interface AnalyticsSummary {
  jobListings: number;
  internshipListings: number;
  totalCompanies: number;
  totalApplications: number;
  kycPending: number;
}

export const getAnalyticsStatusCardsConfig = (summary: AnalyticsSummary) => [
  {
    label: "Active Jobs",
    value: summary.jobListings.toLocaleString(),
    variant: "default" as const,
    icon: <Briefcase />,
    className: "border-border hover:border-primary/40 transition-colors",
  },
  {
    label: "Internships",
    value: summary.internshipListings.toLocaleString(),
    variant: "default" as const,
    icon: <Briefcase />,
    className: "border-border hover:border-secondary/40 transition-colors",
  },
  {
    label: "Companies",
    value: summary.totalCompanies.toLocaleString(),
    variant: "default" as const,
    icon: <Building />,
    className: "border-border hover:border-primary/40 transition-colors",
  },
  {
    label: "Total Apps",
    value: summary.totalApplications.toLocaleString(),
    variant: "default" as const,
    icon: <FileText />,
    className: "border-border hover:border-secondary/40 transition-colors",
  },
  {
    label: "KYC Tasks",
    value: summary.kycPending.toLocaleString(),
    variant: "warning" as const,
    icon: <ShieldCheck />,
    className:
      "md:col-span-1 col-span-2 shadow-md border-premium/40 bg-premium/5",
  },
];
