import { useFormContext, Controller } from "react-hook-form";
import { CreateJobFormData } from "@/features/employer/validations/job.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Asterisk } from "lucide-react";
import {
  Job_Type,
  Work_Mode,
  Company_Type,
  Experience_Level,
  ROLE_CATEGORIES,
  INDUSTRIES,
} from "@/features/employer/validations/base-listing.schema";

export function JobBasicInfo() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateJobFormData>();

  return (
    <section className="border-border/70 space-y-6 border-b pb-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Provide the foundational details for the job securely down below.
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label className="flex items-center gap-1">
            Job Title <Asterisk className="text-destructive size-3" />
          </Label>
          <Input
            {...register("title")}
            placeholder="e.g. Senior Software Engineer"
          />
          {errors.title && (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-1">
            Description <Asterisk className="text-destructive size-3" />
          </Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.description && (
            <p className="text-destructive text-xs">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>
              Job Type <Asterisk className="text-destructive inline size-3" />
            </Label>
            <Controller
              name="employmentType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Job_Type.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employmentType && (
              <p className="text-destructive text-xs">
                {errors.employmentType.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Work Mode <Asterisk className="text-destructive inline size-3" />
            </Label>
            <Controller
              name="workMode"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Work_Mode.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.workMode && (
              <p className="text-destructive text-xs">
                {errors.workMode.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Company Type{" "}
              <Asterisk className="text-destructive inline size-3" />
            </Label>
            <Controller
              name="companyType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Company_Type.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .replace(/\//g, " / ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.companyType && (
              <p className="text-destructive text-xs">
                {errors.companyType.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Experience Level{" "}
              <Asterisk className="text-destructive inline size-3" />
            </Label>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Experience_Level.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experienceLevel && (
              <p className="text-destructive text-xs">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Years of Experience{" "}
              <Asterisk className="text-destructive size-3" />
            </Label>
            <Input
              min={0}
              type="number"
              {...register("experienceInYears")}
              placeholder="e.g. 3"
            />
            {errors.experienceInYears && (
              <p className="text-destructive text-xs">
                {errors.experienceInYears.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Role Category <Asterisk className="text-destructive size-3" />
            </Label>
            <Controller
              name="roleCategory"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.roleCategory && (
              <p className="text-destructive text-xs">
                {errors.roleCategory.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Industry <Asterisk className="text-destructive size-3" />
            </Label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.industry && (
              <p className="text-destructive text-xs">
                {errors.industry.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
