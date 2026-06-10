// Internship-form.tsx
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Asterisk, Briefcase, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInternshipSchema,
  CreateInternshipFormData,
} from "@/features/employer/validations/internship.schema";
import { useCreateMyInternshipPosting, useUpdateMyInternshipPosting } from "@/features/employer/hooks/use-internship";
import { SkillInput } from "./skill-input";
import {
  Work_Mode,
  Company_Type,
  ROLE_CATEGORIES,
  INDUSTRIES,
  Degree_Level,
} from "../validations/base-listing.schema";

export function InternshipForm({ onCancel, initialData }: { onCancel: () => void, initialData?: any }) {
  const { mutate: createInternship, isPending: isCreating } =
    useCreateMyInternshipPosting();
  const { mutate: updateInternship, isPending: isUpdating } =
    useUpdateMyInternshipPosting(initialData?._id as string);

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateInternshipFormData>({
    resolver: zodResolver(
      createInternshipSchema,
    ) as Resolver<CreateInternshipFormData>,
    defaultValues: initialData ? {
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
      startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] as any : undefined,
      isPPO: initialData.isPPO || false,
      openings: initialData.openings || 1,
      skills: initialData.skills || [],
      requirements: initialData.requirements || [],
      benefits: initialData.benefits || [],
      status: initialData.status as any,
      isFeatured: initialData.isFeatured || false,
      opportunityType: "internship",
      applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split("T")[0] as any : undefined,
    } : {
      title: "",
      description: "",
      employmentType: "internship", // Pre-set to match schema enum string
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
    },
  });

  const currentSkills = watch("skills") || [];

  const selectedCountryName = watch("location.country");
  const selectedStateName = watch("location.state");
  const selectedCountryCode = selectedCountryName ? Country.getAllCountries().find(c => c.name === selectedCountryName)?.isoCode : "";
  const selectedStateCode = (selectedStateName && selectedCountryCode) ? State.getStatesOfCountry(selectedCountryCode).find(s => s.name === selectedStateName)?.isoCode : "";

  const onSubmit: SubmitHandler<CreateInternshipFormData> = (data) => {
    if (initialData) {
      updateInternship(data);
    } else {
      createInternship(data);
    }
  };

  const formatLabel = (str: string) =>
    str
      .replace(/_/g, " ")
      .replace(/\//g, " / ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-10 bg-card rounded-3xl border border-border/50 p-6 sm:p-10 shadow-md">
      {/* Basic Info */}
      <section className="space-y-6 border-b pb-10 border-border/70">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Provide the foundational details for the internship securely down below.</p>
        </div>
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Internship Title <Asterisk className="text-destructive size-3" />
            </Label>
            <Input
              {...register("title")}
              placeholder="e.g. Frontend Developer Intern"
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
            <div className="grid gap-2">
              <Label>
                Work Mode <Asterisk className="text-destructive size-3" />
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
                          {formatLabel(mode)}
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
                Company Type <Asterisk className="text-destructive size-3" />
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
                          {formatLabel(type)}
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Role Category <Asterisk className="text-destructive size-3" />
              </Label>
              <Controller
                name="roleCategory"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {formatLabel(cat)}
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
              <Label>
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
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {formatLabel(ind)}
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

      {/* Duration & Stipend */}
      <section className="space-y-6 border-b pb-10 border-border/70">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Duration & Stipend</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Establish base compensation and time period details to attract applicants.</p>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Duration <Asterisk className="text-destructive size-3" />
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 3"
                  {...register("duration.value", { valueAsNumber: true })}
                  className="w-24"
                />
                <Controller
                  name="duration.unit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.duration?.value && (
                <p className="text-destructive text-xs">
                  {errors.duration.value.message}
                </p>
              )}
              {errors.duration?.unit && (
                <p className="text-destructive text-xs">
                  {errors.duration.unit.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-destructive text-xs">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Stipend Type <Asterisk className="text-destructive size-3" />
              </Label>
              <Controller
                name="stipend.type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="performance">
                        Performance Based
                      </SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stipend?.type && (
                <p className="text-destructive text-xs">
                  {errors.stipend.type.message}
                </p>
              )}
            </div>

            {watch("stipend.type") !== "unpaid" && (
              <>
                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    {...register("stipend.amount", { valueAsNumber: true })}
                    placeholder="e.g. 15000"
                  />
                  {errors.stipend?.amount && (
                    <p className="text-destructive text-xs">
                      {errors.stipend.amount.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Currency</Label>
                  <Controller
                    name="stipend.currency"
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
                  <Label>Stipend Period</Label>
                  <Controller
                    name="stipend.period"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Controller
                name="isPPO"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isPPO"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPPO" className="cursor-pointer">
                Pre-Placement Offer (PPO) on completion
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-6 border-b pb-10 border-border/70">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Location Details</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Specify the exact location, or skip if remote.</p>
        </div>
        <div className="space-y-6">
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
        </div>
      </section>

      {/* Education Criteria */}
      <section className="space-y-6 border-b pb-10 border-border/70">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Education Requirements</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Define what academic background the candidate needs.</p>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Minimum Degree Level{" "}
                <Asterisk className="text-destructive size-3" />
              </Label>
              <Controller
                name="education.minimumDegree"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {Degree_Level.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {formatLabel(lvl)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Preferred Fields (Comma separated)</Label>
              <Input
                placeholder="e.g. Computer Science, Information Technology"
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((val) => val.trim())
                    .filter(Boolean);
                  setValue("education.preferredFields", arr);
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Controller
              name="education.isRequired"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="edu-required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="edu-required" className="cursor-pointer">
              Education criteria is strictly mandatory
            </Label>
          </div>
        </div>
      </section>

      {/* Skills & Requirements */}
      <section className="space-y-6 border-b pb-10 border-border/70">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Skills & Requirements</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Select specialized skills and concrete necessities.</p>
        </div>
        <div className="space-y-6">
          <SkillInput
            currentSkills={currentSkills}
            onChange={(skills) =>
              setValue("skills", skills, { shouldValidate: true })
            }
            error={errors.skills?.message}
          />

          <div className="grid gap-2">
            <Label>
              Requirements (One per line){" "}
              <Asterisk className="text-destructive size-3" />
            </Label>
            <Textarea
              placeholder="Must know React basics&#10;Good communication skills..."
              defaultValue={initialData?.requirements?.join("\n")}
              onChange={(e) =>
                setValue(
                  "requirements",
                  e.target.value.split("\n").filter((val) => val.trim() !== ""),
                  { shouldValidate: true },
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
            <Label>
              Number of Openings{" "}
              <Asterisk className="text-destructive size-3" />
            </Label>
            <Input
              type="number"
              {...register("openings", { valueAsNumber: true })}
            />
            {errors.openings && (
              <p className="text-destructive text-xs">
                {errors.openings.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Publishing */}
      <section className="space-y-6 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Publishing & Perks</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Dates, visibility settings, and added benefits.</p>
        </div>
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label>Benefits (One per line)</Label>
            <Textarea
              placeholder="Free meals&#10;Transport allowance..."
              defaultValue={initialData?.benefits?.join("\n")}
              onChange={(e) =>
                setValue(
                  "benefits",
                  e.target.value.split("\n").filter((val) => val.trim() !== ""),
                )
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
              <Label>Visibility</Label>
              <div className="flex h-9 items-center gap-3 rounded-md border px-3">
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="intern-featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="intern-featured"
                  className="cursor-pointer font-normal"
                >
                  Feature this listing
                </Label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-end gap-4 border-t pt-8">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="px-8 py-2">
          {isPending ? (initialData ? "Saving..." : "Posting...") : (initialData ? "Save Changes" : "Post Internship")}
        </Button>
      </div>
    </form>
  );
}
