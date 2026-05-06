import { Company } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, CheckCircle, Clock } from "lucide-react";
import { CompanyMetrics } from "@/features/employer/services/company.service";

interface CompanyHeaderProps {
  company: (Omit<Company, "owner"> & CompanyMetrics) | undefined;
  isLoading?: boolean;
}

export const CompanyHeader = ({ company, isLoading }: CompanyHeaderProps) => {
  if (isLoading || !company) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
      {/* Background Banner */}
      <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600"></div>

      {/* Content */}
      <div className="px-6 pb-6 pt-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 -mt-12 sm:mt-0 relative z-10">
               {/* Logo is typically in overview, but we keep header clean */}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                {company.isVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    <Clock className="mr-1 h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
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
          <div className="flex gap-6 mt-4 sm:mt-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-900">{company.activeJobs || 0}</span>
              <span className="text-xs text-slate-500 font-medium">Active Jobs</span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-900">{company.totalMembers || 0}</span>
              <span className="text-xs text-slate-500 font-medium">Team Members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
