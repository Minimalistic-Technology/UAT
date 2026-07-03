"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserProfileFormValues,
  userProfileSchema,
} from "../validations/profile.schema";
import {
  useGetUserDetails,
  useUpdateProfile,
  useUploadResume,
} from "../hooks/use-user";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  Upload,
  Briefcase,
  GraduationCap,
  Building,
} from "lucide-react";
import { LocationSelector } from "@/components/ui/location-selector";
import { SkillInput } from "@/features/employer/components/skill-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getInlineUrl } from "@/utils";

export function UserProfileForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isFetching } = useGetUserDetails(userId);
  const updateProfileMutation = useUpdateProfile();
  const uploadResumeMutation = useUploadResume();

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      location: { city: "", state: "", country: "" },
      skills: [],
      languages: [],
      experience: [],
      education: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        location: user.location || { city: "", state: "", country: "" },
        skills: user.skills || [],
        languages: user.languages || [],
        experience:
          user.experiences?.map((e: any) => ({
            ...e,
            startDate: e.startDate
              ? new Date(e.startDate).toISOString().split("T")[0]
              : "",
            endDate: e.endDate
              ? new Date(e.endDate).toISOString().split("T")[0]
              : "",
          })) || [],
        education:
          user.educations?.map((e: any) => ({
            ...e,
            graduationYear: e.graduationYear ? String(e.graduationYear) : "",
          })) || [],
      });
    }
  }, [userData, reset]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      uploadResumeMutation.mutate(file, {
        onSuccess: () => setResumeFile(null),
      });
    }
  };

  const onSubmit = (data: UserProfileFormValues) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    });
  };

  if (isFetching) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentResumeUrl = userData?.data?.resume?.url;
  const currentResumeName = userData?.data?.resumeOriginalName;
  const atsScore = userData?.data?.atsScore;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Resume Upload Section */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="text-primary h-5 w-5" />
            Resume / CV
          </CardTitle>
          <CardDescription>
            Upload your latest resume to apply for jobs directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed bg-slate-50/50 p-4 md:flex-row dark:bg-slate-900/50">
            <div className="flex-1 space-y-2">
              {currentResumeUrl ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-3 text-red-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {currentResumeName || "resume.pdf"}
                    </p>
                    <a
                      href={getInlineUrl(currentResumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs font-bold uppercase hover:underline"
                    >
                      View Current Resume
                    </a>
                    
                    {atsScore && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">ATS Score:</span>
                          <Badge 
                            variant={atsScore.overallScore >= 70 ? "default" : atsScore.overallScore >= 40 ? "secondary" : "destructive"}
                          >
                            {atsScore.overallScore}/100
                          </Badge>
                        </div>
                        {atsScore.sectionsMissing && atsScore.sectionsMissing.length > 0 && (
                          <p className="text-xs text-orange-600 font-medium">
                            Missing Sections: {atsScore.sectionsMissing.join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    No resume uploaded
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PDF format, max 5MB.
                  </p>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Label htmlFor="resume-upload" className="cursor-pointer">
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${uploadResumeMutation.isPending ? "bg-muted text-muted-foreground pointer-events-none" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {uploadResumeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {currentResumeUrl ? "Update Resume" : "Upload Resume"}
                </div>
              </Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleResumeUpload}
                disabled={uploadResumeMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input id="firstName" {...form.register("firstName")} />
              {errors.firstName && (
                <p className="text-destructive text-sm font-medium">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input id="lastName" {...form.register("lastName")} />
              {errors.lastName && (
                <p className="text-destructive text-sm font-medium">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="border-b pb-2 text-sm font-semibold text-slate-900">
              Where are you located?
            </h4>
            <LocationSelector
              city={watch("location.city") || ""}
              state={watch("location.state") || ""}
              country={watch("location.country") || ""}
              isRequired={false}
              onChange={(name, value) => {
                if (name === "country") {
                  setValue("location.country", value);
                  setValue("location.state", "");
                  setValue("location.city", "");
                } else if (name === "state") {
                  setValue("location.state", value);
                  setValue("location.city", "");
                } else if (name === "city") {
                  setValue("location.city", value);
                }
              }}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Controller
                control={control}
                name="skills"
                render={({ field }) => (
                  <SkillInput
                    currentSkills={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Press enter to add skills
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="text-primary h-5 w-5" /> Experience
            </CardTitle>
            <CardDescription>
              Add your past and current work experience.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendExp({
                title: "",
                company: "",
                workType: "wfo",
                current: false,
                startDate: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {expFields.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed bg-slate-50 py-6 text-center text-sm text-slate-500">
              No experience added yet. Add your work history to stand out.
            </div>
          ) : (
            expFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-6 rounded-xl border bg-slate-50/30 p-6"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full"
                  onClick={() => removeExp(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(`experience.${index}.title` as const)}
                      placeholder="e.g. Software Engineer"
                    />
                    {errors.experience?.[index]?.title && (
                      <p className="text-destructive text-xs">
                        {errors.experience[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(`experience.${index}.company` as const)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Work Type <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`experience.${index}.workType` as const}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select work mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wfo">
                              Work from office
                            </SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="temporary_wfh">
                              Temporary WFH
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.experience?.[index]?.workType && (
                      <p className="text-destructive text-xs">
                        {errors.experience[index]?.workType?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Location</Label>
                    <div
                      className={
                        watch(`experience.${index}.workType`) === "remote"
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    >
                      <Controller
                        control={control}
                        name={`experience.${index}.location` as const}
                        render={({ field }) => {
                          const parts = field.value
                            ? field.value.split(", ")
                            : [];
                          const currentCity = parts[0] || "";
                          const currentState = parts[1] || "";
                          const currentCountry = parts[2] || "";

                          return (
                            <LocationSelector
                              city={currentCity}
                              state={currentState}
                              country={currentCountry}
                              isRequired={false}
                              onChange={(name, val) => {
                                let newCity = currentCity;
                                let newState = currentState;
                                let newCountry = currentCountry;

                                if (name === "country") {
                                  newCountry = val;
                                  newState = "";
                                  newCity = "";
                                }
                                if (name === "state") {
                                  newState = val;
                                  newCity = "";
                                }
                                if (name === "city") {
                                  newCity = val;
                                }

                                const finalParts = [];
                                if (newCity) finalParts.push(newCity);
                                if (newState) finalParts.push(newState);
                                if (newCountry) finalParts.push(newCountry);

                                field.onChange(finalParts.join(", "));
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                    {errors.experience?.[index]?.location && (
                      <p className="text-destructive text-xs">
                        {errors.experience[index]?.location?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      {...form.register(
                        `experience.${index}.startDate` as const,
                      )}
                    />
                  </div>
                  <div className="flex flex-col justify-end space-y-2">
                    <div className="flex h-[42px] items-center space-x-2">
                      <Controller
                        control={control}
                        name={`experience.${index}.current` as const}
                        render={({ field }) => (
                          <Checkbox
                            id={`current-${index}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor={`current-${index}`}
                        className="text-sm font-medium"
                      >
                        I currently work here
                      </Label>
                    </div>
                  </div>
                  {!watch(`experience.${index}.current`) && (
                    <div className="space-y-2">
                      <Label>
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        {...form.register(
                          `experience.${index}.endDate` as const,
                        )}
                      />
                      {errors.experience?.[index]?.endDate && (
                        <p className="text-destructive text-xs">
                          {errors.experience[index]?.endDate?.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Description / Key Responsibilities</Label>
                  <Textarea
                    {...form.register(
                      `experience.${index}.description` as const,
                    )}
                    placeholder="What did you do in this role?"
                    className="h-24 resize-none"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="text-primary h-5 w-5" /> Education
            </CardTitle>
            <CardDescription>Share your academic background.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendEdu({
                degree: "",
                institution: "",
                fieldOfStudy: "",
                graduationYear: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {eduFields.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed bg-slate-50 py-6 text-center text-sm text-slate-500">
              No education added yet.
            </div>
          ) : (
            eduFields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-6 rounded-xl border bg-slate-50/30 p-6"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full"
                  onClick={() => removeEdu(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Degree / Qualification{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(`education.${index}.degree` as const)}
                      placeholder="e.g. B.Tech"
                    />
                    {errors.education?.[index]?.degree && (
                      <p className="text-destructive text-xs">
                        {errors.education[index]?.degree?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Institution / University{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(
                        `education.${index}.institution` as const,
                      )}
                      placeholder="e.g. MIT"
                    />
                    {errors.education?.[index]?.institution && (
                      <p className="text-destructive text-xs">
                        {errors.education[index]?.institution?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Field of Study <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(
                        `education.${index}.fieldOfStudy` as const,
                      )}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Graduation Year{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register(
                        `education.${index}.graduationYear` as const,
                      )}
                      placeholder="e.g. 2024"
                      type="number"
                    />
                    {errors.education?.[index]?.graduationYear && (
                      <p className="text-destructive text-xs">
                        {errors.education[index]?.graduationYear?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-12">
        <Button
          type="submit"
          size="lg"
          className="shadow-primary/20 h-12 rounded-xl px-10 font-bold shadow-lg"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Save Profile Changes
        </Button>
      </div>
    </form>
  );
}
