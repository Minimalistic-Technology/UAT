import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Asterisk, X, Briefcase, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { JobType, StipendType, DurationType } from "@/types";
import { useCreateMyInternshipPosting } from "@/features/employer/hooks/use-internship";
import { SkillInput } from "./skill-input";

export function InternshipForm({ onCancel }: { onCancel: () => void }) {
  const { mutate: createInternship, isPending } = useCreateMyInternshipPosting();

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } =
    useForm<CreateInternshipFormData>({
      resolver: zodResolver(createInternshipSchema) as Resolver<CreateInternshipFormData>,
      defaultValues: {
        location: { city: "", state: "", country: "" },
        stipend: { currency: "INR", period: "monthly" },
        duration: { unit: DurationType.MONTHS },
        isPPO: false,
        certificateProvided: true,
        openings: 1,
        skills: [],
        requirements: [],
      },
    });

  const currentSkills = watch("skills") || [];

  const onSubmit: SubmitHandler<CreateInternshipFormData> = (data) =>
    createInternship(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Internship Title <Asterisk className="text-destructive size-3" />
            </Label>
            <Input {...register("title")} placeholder="e.g. Frontend Developer Intern" />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Description <Asterisk className="text-destructive size-3" />
            </Label>
            <Textarea {...register("description")} className="min-h-37.5" />
            {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Job Type</Label>
            <Controller name="jobType" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.values(JobType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </div>
        </CardContent>
      </Card>

      {/* Internship-specific: Duration & Stipend */}
      <Card>
        <CardHeader><CardTitle>Duration & Stipend</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Duration <Asterisk className="text-destructive size-3" />
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  {...register("duration.value", { valueAsNumber: true })}
                  className="w-24"
                />
                <Controller name="duration.unit" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(DurationType).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              {errors.duration?.value && <p className="text-destructive text-xs">{errors.duration.value.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("startDate")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Stipend Type <Asterisk className="text-destructive size-3" />
              </Label>
              <Controller name="stipend.type" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(StipendType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.stipend?.type && <p className="text-destructive text-xs">{errors.stipend.type.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Amount (optional)</Label>
              <Input type="number" {...register("stipend.amount", { valueAsNumber: true })} placeholder="e.g. 15000" />
            </div>

            <div className="grid gap-2">
              <Label>Currency</Label>
              <Controller name="stipend.currency" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Stipend Period</Label>
            <Controller name="stipend.period" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>

          {/* PPO & Certificate toggles */}
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Controller name="isPPO" control={control} render={({ field }) => (
                <Checkbox id="isPPO" checked={field.value} onCheckedChange={field.onChange} />
              )} />
              <Label htmlFor="isPPO" className="cursor-pointer">
                Pre-Placement Offer (PPO) on completion
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Controller name="certificateProvided" control={control} render={({ field }) => (
                <Checkbox id="certificate" checked={field.value} onCheckedChange={field.onChange} />
              )} />
              <Label htmlFor="certificate" className="cursor-pointer">
                Certificate provided on completion
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>City</Label>
              <Input {...register("location.city")} placeholder="Mumbai" />
            </div>
            <div className="grid gap-2">
              <Label>State</Label>
              <Input {...register("location.state")} placeholder="Maharashtra" />
            </div>
            <div className="grid gap-2">
              <Label>Country</Label>
              <Input {...register("location.country")} placeholder="India" />
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Controller name="location.remote" control={control} render={({ field }) => (
              <Checkbox id="intern-remote" checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label htmlFor="intern-remote" className="cursor-pointer">Remote Internship</Label>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Requirements */}
      <Card>
        <CardHeader><CardTitle>Skills & Requirements</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <SkillInput
            currentSkills={currentSkills}
            onChange={(skills) => setValue("skills", skills, { shouldValidate: true })}
            error={errors.skills?.message}
          />
          <div className="grid gap-2">
            <Label>Requirements (One per line)</Label>
            <Textarea
              placeholder="Must know React basics..."
              onChange={(e) => setValue("requirements", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Number of Openings</Label>
            <Input type="number" {...register("openings", { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader><CardTitle>Publishing Options</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Benefits (One per line)</Label>
            <Textarea
              placeholder="Free meals, transport allowance..."
              onChange={(e) => setValue("benefits", e.target.value.split("\n").filter(Boolean))}
              className="min-h-37.5"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Application Deadline</Label>
              <Input min={new Date().toISOString().split("T")[0]} type="date" {...register("applicationDeadline")} />
              {errors.applicationDeadline && <p className="text-destructive text-xs">{errors.applicationDeadline.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="flex h-9 items-center gap-3 rounded-md border px-3">
                <Controller name="isFeatured" control={control} render={({ field }) => (
                  <Checkbox id="intern-featured" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="intern-featured" className="cursor-pointer font-normal">Feature this listing</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Posting..." : "Post Internship"}
        </Button>
      </div>
    </form>
  );
}