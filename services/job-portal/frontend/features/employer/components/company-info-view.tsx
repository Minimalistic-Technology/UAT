interface CompanyInfoViewProps {
  company: any;
}

export function CompanyInfoView({ company }: CompanyInfoViewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-1 text-sm font-medium text-slate-500">Description</h4>
        <p className="text-sm whitespace-pre-line text-slate-900">
          {company.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div>
          <h4 className="mb-1 text-sm font-medium text-slate-500">
            Company Size
          </h4>
          <p className="text-sm font-medium text-slate-900">
            {company.companySize || "Not specified"}
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-medium text-slate-500">Industry</h4>
          <p className="text-sm font-medium text-slate-900">
            {company.industry || "Not specified"}
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-medium text-slate-500">Location</h4>
          <p className="text-sm font-medium text-slate-900">
            {[company.location?.city, company.location?.country]
              .filter(Boolean)
              .join(", ") || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}
