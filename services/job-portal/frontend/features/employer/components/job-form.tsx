import { useCreateMyJobPosting, useUpdateMyJobPosting } from "../hooks/use-job";
import { Job } from "@/types/new-index";
import { CreateJobFormData, createJobSchema } from "../validations/job.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, SubmitHandler, Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { JobBasicInfo } from "./forms/job/job-basic-info";
import { JobLocation } from "./forms/job/job-location";
import { JobEducation } from "./forms/job/job-education";
import { JobSalary } from "./forms/job/job-salary";
import { JobSkills } from "./forms/job/job-skills";
import { JobPublishing } from "./forms/job/job-publishing";

export function JobForm({ onCancel, initialData }: { onCancel: () => void, initialData?: Job }) {
  const { mutate: createJob, isPending: isCreating } = useCreateMyJobPosting();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateMyJobPosting(initialData?._id as string);

  const isPending = isCreating || isUpdating;

  const methods = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema) as Resolver<CreateJobFormData>,
    defaultValues: initialData ? {
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
        city: initialData.location?.city || "",
        state: initialData.location?.state || "",
        country: initialData.location?.country || "",
      },
      education: {
        minimumDegree: initialData.education.minimumDegree as any,
        preferredFields: initialData.education.preferredFields || [],
        isRequired: initialData.education.isRequired,
      },
      salary: {
        min: initialData.salary.min,
        max: initialData.salary.max,
        currency: initialData.salary.currency || "INR",
        period: initialData.salary.period || "yearly",
      },
      skills: initialData.skills,
      requirements: initialData.requirements,
      openings: initialData.openings,
      benefits: initialData.benefits || [],
      applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString() as any : undefined,
      isFeatured: initialData.isFeatured,
      status: initialData.status as any,
      opportunityType: "job",
      genderPreference: (initialData as any).genderPreference || "any",
      englishFluency: (initialData as any).englishFluency || "none",
    } : {
      location: { city: "", state: "", country: "" },
      salary: { currency: "INR", period: "yearly" },
      education: { isRequired: false },
      openings: 1,
      skills: [],
      requirements: [],
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
      createJob(data);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full space-y-10 bg-card rounded-3xl border border-border/50 p-6 sm:p-10 shadow-md">
        <JobBasicInfo />
        <JobLocation />
        <JobEducation />
        <JobSalary />
        <JobSkills initialData={initialData} />
        <JobPublishing initialData={initialData} />

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t pt-8">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-32">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="w-full sm:w-40">
            {isPending ? (initialData ? "Saving..." : "Posting...") : (initialData ? "Save Changes" : "Post Job")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
