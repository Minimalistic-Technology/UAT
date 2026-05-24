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

const PREDEFINED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C++",
  "C#",
  ".NET",
  "Ruby",
  "Ruby on Rails",
  "PHP",
  "Laravel",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "React Native",
  "Flutter",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST API",
  "Tailwind CSS",
  "SASS",
  "HTML",
  "CSS",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Figma",
];

function PostJobPage() {
  const router = useRouter();
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const filteredSkills = PREDEFINED_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !currentSkills.includes(skill),
  );

  const onSubmit: SubmitHandler<CreateJobFormData> = async (data) => {
    createJob(data);
  };

  const addSkill = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setValue("skills", [...currentSkills, trimmed], { shouldValidate: true });
    }
    setSkillInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
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

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const skillsToAdd = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let newSkillsList = [...currentSkills];
      skillsToAdd.forEach((s) => {
        if (!newSkillsList.includes(s)) {
          newSkillsList.push(s);
        }
      });
      setValue("skills", newSkillsList, { shouldValidate: true });
      setSkillInput("");
      setShowSuggestions(false);
    } else {
      setSkillInput(val);
      setShowSuggestions(true);
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
                {errors.location?.state && (
                  <p className="text-destructive text-xs">
                    {errors.location.state.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Input {...register("location.country")} placeholder="USA" />
                {errors.location?.country && (
                  <p className="text-destructive text-xs">
                    {errors.location.country.message}
                  </p>
                )}
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
              <div className="relative">
                <div className="focus-within:ring-ring bg-background flex flex-wrap gap-2 rounded-md border p-2 focus-within:ring-2">
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
                    onChange={handleSkillChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      if (skillInput.trim()) {
                        addSkill(skillInput);
                      }
                      setShowSuggestions(false);
                    }}
                    placeholder="Add skill... (comma or enter to add)"
                    className="min-w-[150px] flex-1 bg-transparent outline-none"
                  />
                </div>
                {showSuggestions && skillInput && filteredSkills.length > 0 && (
                  <div className="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill}
                        className="hover:bg-muted cursor-pointer px-4 py-2 text-sm"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input from losing focus
                          addSkill(skill);
                          setShowSuggestions(false);
                        }}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="grid gap-2">
              <Label>Benefits (One per line)</Label>
              <Textarea
                placeholder="Health Insurance..."
                onChange={(e) =>
                  setValue(
                    "benefits",
                    e.target.value.split("\n").filter(Boolean),
                  )
                }
                className="min-h-37.5"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Application Deadline */}
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

              {/* Featured */}
              <div className="grid gap-2">
                <Label>Visibility</Label>
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
                  <Label
                    htmlFor="isFeatured"
                    className="cursor-pointer font-normal"
                  >
                    Feature this listing
                  </Label>
                </div>
              </div>
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
