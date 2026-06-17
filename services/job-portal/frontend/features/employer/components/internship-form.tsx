import {
  useForm,
  FormProvider,
  SubmitHandler,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  createInternshipSchema,
  CreateInternshipFormData,
} from "@/features/employer/validations/internship.schema";
import {
  useCreateMyInternshipPosting,
  useUpdateMyInternshipPosting,
} from "@/features/employer/hooks/use-internship";
import {
  useSaveDraft,
  useDeleteDraft,
} from "@/features/employer/hooks/use-draft";

import { InternshipBasicInfo } from "./forms/internship/internship-basic-info";
import { InternshipDurationStipend } from "./forms/internship/internship-duration-stipend";
import { InternshipLocation } from "./forms/internship/internship-location";
import { InternshipEducation } from "./forms/internship/internship-education";
import { InternshipSkills } from "./forms/internship/internship-skills";
import { InternshipPublishing } from "./forms/internship/internship-publishing";

export function InternshipForm({
  onCancel,
  initialData,
  draftData,
  draftId,
}: {
  onCancel: () => void;
  initialData?: any;
  draftData?: any;
  draftId?: string;
}) {
  const { mutate: createInternship, isPending: isCreating } =
    useCreateMyInternshipPosting();
  const { mutate: updateInternship, isPending: isUpdating } =
    useUpdateMyInternshipPosting(initialData?._id as string);
  const { mutate: saveDraft, isPending: isSavingDraft } = useSaveDraft();
  const { mutate: deleteDraft } = useDeleteDraft();

  const isPending = isCreating || isUpdating || isSavingDraft;

  const methods = useForm<CreateInternshipFormData>({
    resolver: zodResolver(
      createInternshipSchema,
    ) as Resolver<CreateInternshipFormData>,
    defaultValues: draftData
      ? draftData
      : initialData
        ? {
            title: initialData.title,
            description: initialData.description,
            employmentType: initialData.employmentType as any,
            workMode: initialData.workMode as any,
            companyType: initialData.companyType as any,
            roleCategory: initialData.roleCategory as any,
            industry: initialData.industry as any,
            location: {
              city: initialData.location?.city || "",
              state: initialData.location?.state || "",
              country: initialData.location?.country || "",
            },
            education: {
              minimumDegree: initialData.education?.minimumDegree as any,
              preferredFields: initialData.education?.preferredFields || [],
              isRequired: initialData.education?.isRequired || false,
            },
            stipend: {
              type: initialData.stipend?.type as any,
              amount: initialData.stipend?.amount,
              currency: initialData.stipend?.currency || "INR",
              period: initialData.stipend?.period || "monthly",
            },
            duration: {
              unit: initialData.duration?.unit as any,
              value: initialData.duration?.value,
            },
            startDate: initialData.startDate
              ? (new Date(initialData.startDate)
                  .toISOString()
                  .split("T")[0] as any)
              : undefined,
            isPPO: initialData.isPPO || false,
            openings: initialData.openings || 1,
            skills: initialData.skills || [],
            requirements: initialData.requirements || [],
            benefits: initialData.benefits || [],
            status: initialData.status as any,
            isFeatured: initialData.isFeatured || false,
            opportunityType: "internship",
            genderPreference: initialData.genderPreference || "any",
            englishFluency: initialData.englishFluency || "none",
            applicationDeadline: initialData.applicationDeadline
              ? (new Date(initialData.applicationDeadline)
                  .toISOString()
                  .split("T")[0] as any)
              : undefined,
          }
        : {
            title: "",
            description: "",
            employmentType: "internship",
            workMode: "remote",
            companyType: "startup",
            roleCategory: "software_development",
            industry: "information_technology",
            location: { city: "", state: "", country: "" },
            education: {
              minimumDegree: "bachelors",
              preferredFields: [],
              isRequired: false,
            },
            stipend: { type: "fixed", currency: "INR", period: "monthly" },
            duration: { unit: "months", value: 3 },
            isPPO: false,
            openings: 1,
            skills: [],
            requirements: [],
            benefits: [],
            status: "active",
            isFeatured: false,
            opportunityType: "internship",
            genderPreference: "any",
            englishFluency: "none",
          },
  });

  const onSubmit: SubmitHandler<CreateInternshipFormData> = (data) => {
    if (initialData) {
      updateInternship(data);
    } else {
      createInternship(data, {
        onSuccess: () => {
          if (draftId) deleteDraft(draftId);
        },
      });
    }
  };

  const handleSaveDraft = () => {
    saveDraft({
      id: draftId,
      type: "internship",
      formData: methods.getValues(),
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-card border-border/50 w-full space-y-10 rounded-3xl border p-6 shadow-md sm:p-10"
      >
        <InternshipBasicInfo />
        <InternshipDurationStipend />
        <InternshipLocation />
        <InternshipEducation />
        <InternshipSkills initialData={initialData} />
        <InternshipPublishing initialData={initialData} />

        <div className="mt-4 flex flex-col items-center justify-end gap-3 border-t pt-8 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-32"
          >
            Cancel
          </Button>
          {!initialData && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isPending}
              className="w-full sm:w-40"
            >
              {isSavingDraft ? "Saving..." : "Save as Draft"}
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="w-full sm:w-40">
            {isCreating || isUpdating
              ? initialData
                ? "Saving..."
                : "Posting..."
              : initialData
                ? "Save Changes"
                : "Post Internship"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
