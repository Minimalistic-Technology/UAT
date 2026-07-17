import { useCreateMyJobPosting, useUpdateMyJobPosting } from "../hooks/use-job";
import { useSaveDraft, useDeleteDraft } from "../hooks/use-draft";
import { FlattenedJob as Job } from "@/types";
import { CreateJobFormData, createJobSchema } from "../validations/job.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Resolver,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { JobBasicInfo } from "./forms/job/job-basic-info";
import { JobLocation } from "./forms/job/job-location";
import { JobEducation } from "./forms/job/job-education";
import { JobSalary } from "./forms/job/job-salary";
import { JobSkills } from "./forms/job/job-skills";
import { JobPublishing } from "./forms/job/job-publishing";

export function JobForm({
  onCancel,
  initialData,
  draftData,
  draftId,
}: {
  onCancel: () => void;
  initialData?: Job;
  draftData?: any;
  draftId?: string;
}) {
  const { mutate: createJob, isPending: isCreating } = useCreateMyJobPosting();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateMyJobPosting(
    initialData?.id as string,
  );
  const { mutate: saveDraft, isPending: isSavingDraft } = useSaveDraft();
  const { mutate: deleteDraft } = useDeleteDraft();

  const isPending = isCreating || isUpdating || isSavingDraft;

  const methods = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema) as Resolver<CreateJobFormData>,
    defaultValues: draftData
      ? draftData
      : initialData
        ? {
            title: initialData.title,
            description: initialData.description,
            employmentType: initialData.employmentType as any,
            workMode: initialData.workMode as any,
            companyType: initialData.companyType as any,
            experienceLevel: initialData.experienceLevel as any,
            experienceInYears: initialData.experienceInYears,
            roleCategory: initialData.roleCategory as any,
            industry: initialData.industry as any,
            location: {
              city: initialData.city || "",
              state: initialData.state || "",
              country: initialData.country || "",
            },
            education: {
              minimumDegree: initialData.minimumDegree as any,
              preferredFields: initialData.preferredFields || [],
              isRequired: initialData.isDegreeRequired,
            },
            salary: {
              min: initialData.salaryMin,
              max: initialData.salaryMax,
              currency: initialData.salaryCurrency || "INR",
              period: initialData.salaryPeriod || "yearly",
            },
            skills: initialData.skills,
            requirements: initialData.requirements,
            openings: initialData.openings,
            benefits: initialData.benefits || [],
            applicationDeadline: initialData.applicationDeadline
              ? (new Date(initialData.applicationDeadline).toISOString() as any)
              : undefined,
            status: initialData.status as any,
            opportunityType: "job",
            genderPreference: (initialData as any).genderPreference || "any",
            englishFluency: (initialData as any).englishFluency || "none",
          }
        : {
            title: "",
            description: "",
            employmentType: "full_time",
            workMode: "work from office",
            companyType: "startup",
            experienceLevel: "entry",
            experienceInYears: 0,
            roleCategory: "software_development",
            industry: "information_technology",
            location: { city: "", state: "", country: "" },
            salary: { currency: "INR", period: "yearly" },
            education: {
              minimumDegree: "bachelors",
              preferredFields: [],
              isRequired: false,
            },
            openings: 1,
            skills: [],
            requirements: [],
            benefits: [],
            isFeatured: false,
            status: "active",
            opportunityType: "job",
            genderPreference: "any",
            englishFluency: "none",
          },
  });

  const onSubmit: SubmitHandler<CreateJobFormData> = (data) => {
    if (initialData) {
      updateJob(data);
    } else {
      createJob(data, {
        onSuccess: () => {
          if (draftId) deleteDraft(draftId);
        },
      });
    }
  };

  const handleSaveDraft = () => {
    saveDraft({
      id: draftId,
      type: "job",
      formData: methods.getValues(),
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-card border-border/50 w-full space-y-10 rounded-3xl border p-6 shadow-md sm:p-10"
      >
        <JobBasicInfo />
        <JobLocation />
        <JobEducation />
        <JobSalary />
        <JobSkills initialData={initialData} />
        <JobPublishing initialData={initialData} />

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
                : "Post Job"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
