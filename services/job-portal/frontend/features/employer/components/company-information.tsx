import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useUpdateCompany } from "@/features/employer/hooks/use-company";
import {
  companyFormSchema,
  CompanyFormValues,
} from "@/features/employer/validations/company.schema";
import { KycStatus } from "@/types/enums";
import { useGetUserDetails } from "@/hooks/use-user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CompanyInfoForm } from "./company-info-form";
import { CompanyInfoView } from "./company-info-view";

export const CompanyInformation = ({ company }: { company: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateCompany, isPending } = useUpdateCompany();
  const { data: userDetailsResponse } = useGetUserDetails();

  const user = userDetailsResponse?.data;
  const isOwner = user && company?.owner?.id === user.id;
  const isKycCompleted = company?.isVerified;
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name || "",
      description: company?.description || "",
      website: company?.website || "",
      industry: company?.industry || "",
      companySize: company?.companySize || "",
      location: {
        address: company?.location?.address || "",
        city: company?.location?.city || "",
        state: company?.location?.state || "",
        country: company?.location?.country || "",
        zipCode: company?.location?.zipCode || "",
      },
      socialLinks: {
        linkedin: company?.socialLinks?.linkedin || "",
        twitter: company?.socialLinks?.twitter || "",
        facebook: company?.socialLinks?.facebook || "",
      },
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        industry: company.industry || "",
        companySize: company.companySize || "",
        location: {
          address: company.location?.address || "",
          city: company.location?.city || "",
          state: company.location?.state || "",
          country: company.location?.country || "",
          zipCode: company.location?.zipCode || "",
        },
        socialLinks: {
          linkedin: company.socialLinks?.linkedin || "",
          twitter: company.socialLinks?.twitter || "",
          facebook: company.socialLinks?.facebook || "",
        },
      });
    }
  }, [company, form.reset]);

  const onSubmit = (data: CompanyFormValues) => {
    // @ts-ignore
    updateCompany(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
      <div className="flex items-center justify-between border-b bg-slate-50/50 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Company Information
          </h3>
          <p className="text-sm text-slate-500">
            Manage your company details and location
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => {
            if (!isOwner) {
              toast.error(
                "You are not authorized to update the company profile",
              );
              return;
            }
            setIsEditing(true);
          }}
        >
          Edit Details
        </Button>
      </div>

      <div className="p-6">
        <CompanyInfoView company={company} />
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="scrollbar-hide max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company Information</DialogTitle>
            <DialogDescription>
              Update the details and location of your company here.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <CompanyInfoForm
              form={form}
              onSubmit={onSubmit}
              isPending={isPending}
              isKycCompleted={isKycCompleted}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
