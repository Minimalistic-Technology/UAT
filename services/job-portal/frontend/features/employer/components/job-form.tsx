import { useCreateMyJobPosting } from "../hooks/use-job";
import {
  CreateJobFormData,
  createJobSchema,
} from "../validations/job.schema";
import {
  Company_Type,
  Work_Mode,
  Degree_Level,
  ROLE_CATEGORIES,
  INDUSTRIES,
} from "../validations/base-listing.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Asterisk } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExperienceLevel, JobType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { SkillInput } from "./skill-input";
import { Button } from "@/components/ui/button";

export function JobForm({ onCancel }: { onCancel: () => void }) {
  const { mutate: createJob, isPending } = useCreateMyJobPosting();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema) as Resolver<CreateJobFormData>,
    defaultValues: {
      location: { city: "", state: "", country: "" },
      salary: { currency: "INR", period: "yearly" },
      education: { isRequired: false },
      openings: 1,
      skills: [],
      requirements: [],
      isFeatured: false,
      status: "open",
    },
  });

  const currentSkills = watch("skills") || [];

  const onSubmit: SubmitHandler<CreateJobFormData> = (data) => createJob(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Textarea {...register("description")} className="min-h-37.5" />
            {errors.description && (
              <p className="text-destructive text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Job Type */}
            <div className="grid gap-2">
              <Label>
                Job Type <Asterisk className="text-destructive size-3 inline" />
              </Label>
              <Controller
                name="jobType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(JobType).map((type) => (
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
              {errors.jobType && (
                <p className="text-destructive text-xs">
                  {errors.jobType.message}
                </p>
              )}
            </div>

            {/* Work Mode */}
            <div className="grid gap-2">
              <Label>
                Work Mode{" "}
                <Asterisk className="text-destructive size-3 inline" />
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

            {/* Company Type */}
            <div className="grid gap-2">
              <Label>
                Company Type{" "}
                <Asterisk className="text-destructive size-3 inline" />
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

            {/* Experience Level */}
            <div className="grid gap-2">
              <Label>
                Experience Level{" "}
                <Asterisk className="text-destructive size-3 inline" />
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
                      {Object.values(ExperienceLevel).map((level) => (
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

          {/* Experience in Years */}
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

          {/* Role Category */}
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

             {/* Industry */}
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
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>
                City <Asterisk className="text-destructive size-3 inline" />
              </Label>
              <Input {...register("location.city")} placeholder="Mumbai" />
              {errors.location?.city && (
                <p className="text-destructive text-xs">
                  {errors.location.city.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>
                State <Asterisk className="text-destructive size-3 inline" />
              </Label>
              <Input
                {...register("location.state")}
                placeholder="Maharashtra"
              />
              {errors.location?.state && (
                <p className="text-destructive text-xs">
                  {errors.location.state.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>
                Country <Asterisk className="text-destructive size-3 inline" />
              </Label>
              <Input {...register("location.country")} placeholder="India" />
              {errors.location?.country && (
                <p className="text-destructive text-xs">
                  {errors.location.country.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Minimum Degree{" "}
                <Asterisk className="text-destructive size-3 inline" />
              </Label>
              <Controller
                name="education.minimumDegree"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {Degree_Level.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.education?.minimumDegree && (
                <p className="text-destructive text-xs">
                  {errors.education.minimumDegree.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Preferred Fields (comma-separated)</Label>
              <Input
                placeholder="e.g. Computer Science, Information Technology"
                onChange={(e) =>
                  setValue(
                    "education.preferredFields",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
              {errors.education?.preferredFields && (
                <p className="text-destructive text-xs">
                  {errors.education.preferredFields.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Controller
              name="education.isRequired"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="educationRequired"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="educationRequired" className="cursor-pointer">
              Education qualification is mandatory
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Range</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {/* No valueAsNumber — preprocess handles coercion */}
          <div className="grid gap-2">
            <Label>Min</Label>
            <Input
              min={0}
              type="number"
              {...register("salary.min")}
            />
            {errors.salary?.min && (
              <p className="text-destructive text-xs">
                {errors.salary.min.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Max</Label>
            <Input
              min={0}
              type="number"
              {...register("salary.max")}
            />
            {errors.salary?.max && (
              <p className="text-destructive text-xs">
                {errors.salary.max.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Controller
              name="salary.currency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label>Period</Label>
            <Controller
              name="salary.period"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {/* Salary refine error (min > max) shown under Max */}
          {errors.salary?.max && (
            <p className="text-destructive text-xs md:col-start-2">
              {errors.salary.max.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SkillInput
            currentSkills={currentSkills}
            onChange={(skills) =>
              setValue("skills", skills, { shouldValidate: true })
            }
            error={errors.skills?.message}
          />
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Requirements (one per line){" "}
              <Asterisk className="text-destructive size-3" />
            </Label>
            <Textarea
              placeholder="Must have 5 years experience..."
              onChange={(e) =>
                setValue(
                  "requirements",
                  e.target.value.split("\n").filter(Boolean),
                )
              }
            />
            {errors.requirements && (
              <p className="text-destructive text-xs">
                {errors.requirements.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Number of Openings</Label>
            <Input
              type="number"
              min={0}
              {...register("openings", { valueAsNumber: true })}
            />
            {errors.openings && (
              <p className="text-destructive text-xs">
                {errors.openings.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Benefits (one per line)</Label>
            <Textarea
              placeholder="Health Insurance..."
              onChange={(e) =>
                setValue("benefits", e.target.value.split("\n").filter(Boolean))
              }
              className="min-h-37.5"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Application Deadline</Label>
              <Input
                min={new Date().toISOString().split("T")[0]}
                type="date"
                {...register("applicationDeadline")}
              />
              {errors.applicationDeadline && (
                <p className="text-destructive text-xs">
                  {errors.applicationDeadline.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent defaultValue={"active"}>
                      <SelectItem value="active" >Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex h-9 items-center gap-3 rounded-md border px-3">
            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isFeatured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer font-normal">
              Feature this listing
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Posting..." : "Post Job"}
        </Button>
      </div>
    </form>
  );
}