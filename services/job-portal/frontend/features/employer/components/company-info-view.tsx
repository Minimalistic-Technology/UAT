interface CompanyInfoViewProps {
    company: any;
}

export function CompanyInfoView({ company }: CompanyInfoViewProps) {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Description</h4>
                <p className="text-sm text-slate-900 whitespace-pre-line">
                    {company.description || "No description provided."}
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Company Size</h4>
                    <p className="text-sm text-slate-900 font-medium">
                        {company.companySize || "Not specified"}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Industry</h4>
                    <p className="text-sm text-slate-900 font-medium">
                        {company.industry || "Not specified"}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Location</h4>
                    <p className="text-sm text-slate-900 font-medium">
                        {[company.location?.city, company.location?.country].filter(Boolean).join(", ") || "Not specified"}
                    </p>
                </div>
            </div>
        </div>
    );
}
