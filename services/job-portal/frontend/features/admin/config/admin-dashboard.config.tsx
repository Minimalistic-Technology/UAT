import React from "react";
import {
  IndianRupee,
  Users,
  Briefcase,
  ShieldCheck,
  Building2,
} from "lucide-react";

export interface DashboardSummary {
  totalRevenue: number;
  activeUsers: number;
  kycPending: number;
  jobListings: number;
  totalCompanies: number;
  internshipListings: number;
}

export const getStatusCardsConfig = (summary: DashboardSummary) => [
  {
    label: "Total Revenue",
    value: `₹${summary.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    variant: "default" as const,
    icon: <IndianRupee />,
    className: "border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
  {
    label: "Subscriptions",
    value: summary.activeUsers.toLocaleString(),
    variant: "default" as const,
    icon: <Users />,
    className: "border-[#8b5cf6]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
  {
    label: "Pending KYC",
    value: summary.kycPending.toLocaleString(),
    variant: "warning" as const,
    icon: <ShieldCheck />,
    className: "border-rose-500/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
  {
    label: "Job Listings",
    value: summary.jobListings.toLocaleString(),
    variant: "default" as const,
    icon: <Briefcase />,
    className: "border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
  {
    label: "Companies",
    value: summary.totalCompanies.toLocaleString(),
    variant: "default" as const,
    icon: <Building2 />,
    className: "border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
  {
    label: "Internships",
    value: summary.internshipListings.toLocaleString(),
    variant: "default" as const,
    icon: <Briefcase />,
    className: "border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
  },
];
