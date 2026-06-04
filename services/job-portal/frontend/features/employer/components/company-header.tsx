import { Company } from "@/types/new-index";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, User, CheckCircle, Clock } from "lucide-react";
import { CompanyMetrics } from "../types/company.type";

interface CompanyHeaderProps {
  company: (Omit<Company, "owner"> & CompanyMetrics) | undefined;
  isLoading?: boolean;
}

export const CompanyHeader = ({ company, isLoading }: CompanyHeaderProps) => {
  if (isLoading || !company) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Background Banner */}
      <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600"></div>

      {/* Content */}
      <div className="relative px-6 pt-4 pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {company.name}
                </h1>
                {company.isVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 hover:bg-amber-100"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                {/* @ts-ignore */}
                {company.owner?.firstName && company.owner?.lastName ? (
                  <div className="flex items-center gap-1 text-foreground">
                    <User className="h-4 w-4" />
                    {/* @ts-ignore */}
                    {`${company.owner?.firstName ?? ""} ${company.owner?.lastName ?? ""}`.trim()}
                  </div>
                ) : null}

                {company.industry && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {company.industry}
                  </div>
                )}

                {company.location?.city && company.location?.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location.city}, {company.location.country}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex gap-6 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:mt-0">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-900">
                {company.activeListings || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Active Listings
              </span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-900">
                {company.totalMembers || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Team Members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
