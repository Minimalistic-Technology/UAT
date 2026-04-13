"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Asterisk, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createJobSchema,
  CreateJobFormData,
} from "@/features/employer/validations/job.schema";
import { ExperienceLevel, JobType } from "@/types";
import { useCreateMyJobPosting } from "@/features/employer/hooks/use-job";

function PostJobPage() {
  const router = useRouter();
  const [skillInput, setSkillInput] = useState("");
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
      location: {
        remote: false,
        city: "",
        state: "",
        country: "",
      },
      salary: {
        currency: "INR",
        period: "yearly",
      },
      openings: 1,
      skills: [],
      requirements: [],
    },
  });

  // Watch skills for the badge list
  const currentSkills = watch("skills") || [];

  const onSubmit: SubmitHandler<CreateJobFormData> = async (data) => {
    createJob(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !currentSkills.includes(val)) {
        setValue("skills", [...currentSkills, val], { shouldValidate: true });
        setSkillInput("");
      }
    } else if (
      e.key === "Backspace" &&
      !skillInput &&
      currentSkills.length > 0
    ) {
      const newSkills = [...currentSkills];
      newSkills.pop();
      setValue("skills", newSkills, { shouldValidate: true });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      currentSkills.filter((s) => s !== skillToRemove),
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Post a New Job
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Listing details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
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
                <p className="text-destructive text-xs">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Job Description <Asterisk className="text-destructive size-3" />
              </Label>
              <Textarea {...register("description")} className="min-h-37.5" />
              {errors.description && (
                <p className="text-destructive text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Job Type</Label>
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
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label>Experience Level</Label>
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
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location - Nested Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  {...register("location.city")}
                  placeholder="San Francisco"
                />
                {errors.location?.city && (
                  <p className="text-destructive text-xs">
                    {errors.location.city.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input {...register("location.state")} placeholder="CA" />
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Input {...register("location.country")} placeholder="USA" />
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Controller
                name="location.remote"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="remote"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="remote" className="cursor-pointer">
                Remote Position
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Salary - Nested Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Range</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Min</Label>
              <Input type="number" {...register("salary.min")} />
            </div>
            <div className="grid gap-2">
              <Label>Max</Label>
              <Input type="number" {...register("salary.max")} />
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
          </CardContent>
        </Card>

        {/* Skills & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tag Input for Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="focus-within:ring-ring flex flex-wrap gap-2 rounded-md border p-2 focus-within:ring-2">
                {currentSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-secondary/50 hover:bg-secondary rounded-sm border-none px-2 py-1 transition-colors"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="text-muted-foreground hover:text-destructive h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </button>
                  </Badge>
                ))}
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add skill..."
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
              {errors.skills && (
                <p className="text-destructive text-xs">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* Requirements as a managed array */}
            <div className="grid gap-2">
              <Label>Requirements (One per line)</Label>
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
              <Input type="number" {...register("openings")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PostJobPage;
