"use client";

import { useRef } from "react";
import { useGetMyCompanyDetails, useUploadCompanyLogo } from "@/features/employer/hooks/use-company";
import { CompanyHeader } from "../../../features/employer/components/company-header";
import { CompanyOverview } from "../../../features/employer/components/company-overview";
import { CompanyInformation } from "../../../features/employer/components/company-information";
import { CompanyProfileSkeleton } from "../../../features/employer/components/company-skeleton";
import { CompanyPlanDetails } from "../../../features/employer/components/company-plan-details";
import { CompanyDangerZone } from "../../../features/employer/components/company-danger-zone";

const CompanyProfilePage = () => {
  const { data: companyResponse, isLoading: isCompanyLoading } = useGetMyCompanyDetails();
  const { mutate: uploadLogo, isPending: isLogoUploading } = useUploadCompanyLogo();

  const logoInputRef = useRef<HTMLInputElement>(null);

  const company = companyResponse?.data;

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("logo", file);
      uploadLogo(formData);
    }
  };

  if (isCompanyLoading) {
    return <div className="p-6"><CompanyProfileSkeleton /></div>;
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={logoInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleLogoSelect}
      />

      <CompanyHeader company={company} isLoading={isCompanyLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        <CompanyOverview
          company={company}
          isLogoUploading={isLogoUploading}
          logoInputRef={logoInputRef}
        />

        <div className="space-y-6 lg:col-span-2">
          <CompanyInformation company={company} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CompanyPlanDetails company={company} />
            <CompanyDangerZone company={company} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;