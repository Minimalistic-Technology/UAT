import { Calendar, CreditCard } from "lucide-react";

interface CompanyPlanDetailsProps {
  company: any;
}

export const CompanyPlanDetails = ({ company }: CompanyPlanDetailsProps) => {
  return (
    <div className="rounded-[20px] border-0 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6 h-full">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Plan Details
      </h3>

      {company.subscription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Current Plan</span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              {company.currentPlan?.name || "Active Plan"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Expiry Date
            </span>
            <span className="text-sm font-medium text-slate-900">
              {company.subscription.expiryDate ? new Date(company.subscription.expiryDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }) : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Remaining Posts</span>
            <span className="text-sm font-medium text-slate-900">
              {company.remainingJobPosts ?? "N/A"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          No active subscription plan.
        </div>
      )}
    </div>
  );
};
