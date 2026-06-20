import React from "react";
import {
  Briefcase,
  Users,
  Sparkles,
  FileText,
  AlertCircle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { CompanyDashboardDetails } from "../types/company.type";

export interface DashboardStatCardConfig {
  id: string;
  label: string;
  getValue: (
    companyDetails: CompanyDashboardDetails | undefined,
  ) => string | number;
  icon: React.ReactNode;
  variant: "default" | "warning";
  className: string;
}

export const DASHBOARD_STAT_CARDS: DashboardStatCardConfig[] = [
  {
    id: "active-listings",
    label: "Active Listings",
    getValue: (companyDetails) => Number(companyDetails?.activeListings || 0),
    icon: <Briefcase />,
    variant: "default",
    className:
      "border-primary/20 bg-card/50 hover:bg-card transition-colors duration-300",
  },
  {
    id: "team-members",
    label: "Team Members",
    getValue: (companyDetails) => Number(companyDetails?.totalMembers || 0),
    icon: <Users />,
    variant: "default",
    className:
      "border-secondary/20 bg-card/50 hover:bg-card transition-colors duration-300",
  },
  {
    id: "subscription",
    label: "Subscription",
    getValue: (companyDetails) =>
      companyDetails?.currentPlan?.name || "No Plan",
    icon: <Sparkles />,
    variant: "warning",
    className:
      "bg-premium/5 ring-premium/10 shadow-[0_0_20px_rgba(var(--premium-rgb),0.1)] ring-1 transition-colors duration-300",
  },
  {
    id: "remaining-job-posts",
    label: "Remaining Job Posts",
    getValue: (companyDetails) => {
      if (companyDetails?.remainingJobPosts === -1) return "Unlimited";
      if (
        companyDetails?.remainingJobPosts !== undefined &&
        companyDetails?.remainingJobPosts !== null
      ) {
        return Number(companyDetails.remainingJobPosts).toString();
      }
      return "0";
    },
    icon: <FileText />,
    variant: "default",
    className:
      "border-primary/20 bg-card/50 hover:bg-card transition-colors duration-300",
  },
];

export type DashboardAlertVariant = "warning" | "destructive" | "secondary";

export interface DashboardAlertConfig {
  id: string;
  condition: (companyDetails: CompanyDashboardDetails | undefined) => boolean;
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  variant: DashboardAlertVariant;
  showRejectionReason?: boolean;
}

export const DASHBOARD_ALERTS: DashboardAlertConfig[] = [
  {
    id: "no-plan",
    condition: (companyDetails) =>
      companyDetails?.isVerified === false && !companyDetails?.currentPlan,
    icon: AlertCircle,
    title: "Action Required: Choose a Subscription",
    description:
      "To get started, please purchase a plan first. Once subscribed, you will be able to complete KYC and post jobs.",
    actionLabel: "View Plans",
    actionLink: "/employer-dashboard/plans",
    variant: "warning",
  },
  {
    id: "kyc-required",
    condition: (companyDetails) =>
      companyDetails?.isVerified === false &&
      !!companyDetails?.currentPlan &&
      !companyDetails?.kycStatus,
    icon: ShieldAlert,
    title: "Business Verification Required",
    description:
      "Your account is currently unverified. To activate job posts and unlock full access, please complete your KYC document verification.",
    actionLabel: "Complete KYC",
    actionLink: "/employer-dashboard/settings/verify",
    variant: "destructive",
  },
  {
    id: "kyc-pending",
    condition: (companyDetails) =>
      companyDetails?.isVerified === false &&
      !!companyDetails?.currentPlan &&
      companyDetails?.kycStatus === "pending",
    icon: Loader2,
    title: "Verification in Progress",
    description:
      "Your KYC documents are currently under priority review. We will notify you once verification is complete.",
    variant: "secondary",
  },
  {
    id: "kyc-rejected",
    condition: (companyDetails) =>
      companyDetails?.isVerified === false &&
      !!companyDetails?.currentPlan &&
      companyDetails?.kycStatus === "rejected",
    icon: ShieldAlert,
    title: "KYC Rejected",
    description:
      "Your recent submission was rejected. Re-submit your documents referencing the feedback provided below.",
    actionLabel: "Re-submit Details",
    actionLink: "/employer-dashboard/settings/verify",
    variant: "destructive",
    showRejectionReason: true,
  },
];
