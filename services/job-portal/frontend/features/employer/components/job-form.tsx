import { useCreateMyJobPosting, useUpdateMyJobPosting } from "../hooks/use-job";
import { Job } from "@/types/new-index";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateJobFormData, createJobSchema } from "../validations/job.schema";
import {
  Company_Type,
  Work_Mode,
  Degree_Level,
  ROLE_CATEGORIES,
  INDUSTRIES,
  Experience_Level,
  Job_Type,
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
import { Checkbox } from "@/components/ui/checkbox";
import { SkillInput } from "./skill-input";
import { Button } from "@/components/ui/button";

export function JobForm({ onCancel, initialData }: { onCancel: () => void, initialData?: Job }) {
  const { mutate: createJob, isPending: isCreating } = useCreateMyJobPosting();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateMyJobPosting(initialData?._id as string);

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateJobFormData>({
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
    },
  });

  const currentSkills = watch("skills") || [];

  const selectedCountryName = watch("location.country");
  const selectedStateName = watch("location.state");
  const selectedCountryCode = selectedCountryName ? Country.getAllCountries().find(c => c.name === selectedCountryName)?.isoCode : "";
  const selectedStateCode = (selectedStateName && selectedCountryCode) ? State.getStatesOfCountry(selectedCountryCode).find(s => s.name === selectedStateName)?.isoCode : "";

  const onSubmit: SubmitHandler<CreateJobFormData> = (data) => {
    if (initialData) {
      updateJob(data);
    } else {
      createJob(data);
    }
  };

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

          <div className="grid gap-4 md:grid-cols-4">
            {/* Job Type */}
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

            {/* Work Mode */}
            <div className="grid gap-2">
              <Label>
                Work Mode{" "}
                <Asterisk className="text-destructive inline size-3" />
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

            {/* Experience Level */}
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

          <div className="grid gap-4 md:grid-cols-4">
            {/* Years of Experience */}
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
            {/* Country */}
            <div className="grid gap-2">
              <Label>Country {watch("workMode") !== "remote" && <Asterisk className="text-destructive inline size-3" />}</Label>
              <Controller
                name="location.country"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("location.state", "");
                      setValue("location.city", "");
                    }}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Country.getAllCountries().map(country => (
                        <SelectItem key={country.isoCode} value={country.name}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location?.country && <p className="text-destructive text-xs">{errors.location.country.message}</p>}
            </div>

            {/* State */}
            <div className="grid gap-2">
              <Label>State {watch("workMode") !== "remote" && <Asterisk className="text-destructive inline size-3" />}</Label>
              <Controller
                name="location.state"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("location.city", "");
                    }}
                    value={field.value || ""}
                    disabled={!selectedCountryCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map(state => (
                        <SelectItem key={state.isoCode} value={state.name}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location?.state && <p className="text-destructive text-xs">{errors.location.state.message}</p>}
            </div>

            {/* City */}
            <div className="grid gap-2">
              <Label>City {watch("workMode") !== "remote" && <Asterisk className="text-destructive inline size-3" />}</Label>
              <Controller
                name="location.city"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedStateCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountryCode && selectedStateCode && City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(city => (
                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location?.city && <p className="text-destructive text-xs">{errors.location.city.message}</p>}
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
                <Asterisk className="text-destructive inline size-3" />
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
            <Input min={0} type="number" {...register("salary.min")} />
            {errors.salary?.min && (
              <p className="text-destructive text-xs">
                {errors.salary.min.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Max</Label>
            <Input min={0} type="number" {...register("salary.max")} />
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
              defaultValue={initialData?.requirements?.join("\n")}
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
              defaultValue={initialData?.benefits?.join("\n")}
              onChange={(e) =>
                setValue("benefits", e.target.value.split("\n").filter(Boolean))
              }
              className="min-h-37.5"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Application Deadline</Label>
              <Controller
                name="applicationDeadline"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "d/M/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.applicationDeadline && (
                <p className="text-destructive text-xs">
                  {errors.applicationDeadline.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="flex h-11 items-center gap-3 rounded-lg border px-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (initialData ? "Saving..." : "Posting...") : (initialData ? "Save Changes" : "Post Job")}
        </Button>
      </div>
    </form>
  );
}
