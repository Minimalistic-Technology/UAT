"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/hooks/use-user";
import { User, Experience } from "@/types";

import { ProfileFormValues, profileSchema } from "@/validations";

interface EditProfileDialogProps {
  user: User | null;
  children: React.ReactNode;
}

export const EditProfileDialog = ({ user, children }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "skills",
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: "languages",
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        location: {
          city: user.location?.city || "",
          state: user.location?.state || "",
          country: user.location?.country || "",
        },
        skills: user.skills?.map((s) => ({ value: s })) || [],
        languages: user.languages?.map((l) => ({ value: l })) || [],
        experience: user.experience?.map((e) => ({
          title: e.title || "",
          company: e.company || "",
          location: e.location || "",
          startDate: e.startDate ? new Date(e.startDate).toISOString().split("T")[0] : "",
          endDate: e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : "",
          current: e.current || false,
          description: e.description || "",
        })) || [],
        education: user.education?.map((e) => ({
          degree: e.degree || "",
          institution: e.institution || "",
          graduationYear: e.graduationYear || new Date().getFullYear(),
          fieldOfStudy: e.fieldOfStudy || "",
        })) || [],
      });
    }
  }, [user, open, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      ...data,
      skills: data.skills?.map((s) => s.value),
      languages: data.languages?.map((l) => l.value),
      experience: data.experience?.map(e => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined
      })) as Experience[],
    };

    updateProfile(payload, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="skills">Skills & Languages</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...register("firstName")} />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...register("lastName")} />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...register("location.city")} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input {...register("location.state")} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input {...register("location.country")} />
                </div>
              </div>
            </TabsContent>

            {/* Skills & Languages Tab */}
            <TabsContent value="skills" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Skills</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ value: "" })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Skill
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input {...register(`skills.${index}.value`)} placeholder="e.g. React" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      {errors.skills?.[index]?.value && (
                        <p className="text-red-500 text-sm">{errors.skills[index]?.value?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Languages</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendLanguage({ value: "" })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Language
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {languageFields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input {...register(`languages.${index}.value`)} placeholder="e.g. English" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      {errors.languages?.[index]?.value && (
                        <p className="text-red-500 text-sm">{errors.languages[index]?.value?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Work Experience</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Experience
                </Button>
              </div>
              <div className="space-y-6">
                {expFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                    <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeExp(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input {...register(`experience.${index}.title`)} />
                        {errors.experience?.[index]?.title && (
                          <p className="text-red-500 text-sm">{errors.experience[index]?.title?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input {...register(`experience.${index}.company`)} />
                        {errors.experience?.[index]?.company && (
                          <p className="text-red-500 text-sm">{errors.experience[index]?.company?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input {...register(`experience.${index}.location`)} />
                      </div>
                      <div className="space-y-2 flex items-end pb-2 gap-2">
                        <input type="checkbox" id={`current-${index}`} {...register(`experience.${index}.current`)} />
                        <Label htmlFor={`current-${index}`}>I currently work here</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" {...register(`experience.${index}.startDate`)} />
                        {errors.experience?.[index]?.startDate && (
                          <p className="text-red-500 text-sm">{errors.experience[index]?.startDate?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input type="date" {...register(`experience.${index}.endDate`)} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea {...register(`experience.${index}.description`)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Education</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ degree: "", institution: "", graduationYear: new Date().getFullYear(), fieldOfStudy: "" })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Education
                </Button>
              </div>
              <div className="space-y-6">
                {eduFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                    <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeEdu(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input {...register(`education.${index}.degree`)} />
                        {errors.education?.[index]?.degree && (
                          <p className="text-red-500 text-sm">{errors.education[index]?.degree?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input {...register(`education.${index}.institution`)} />
                        {errors.education?.[index]?.institution && (
                          <p className="text-red-500 text-sm">{errors.education[index]?.institution?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input {...register(`education.${index}.fieldOfStudy`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Graduation Year</Label>
                        <Input type="number" {...register(`education.${index}.graduationYear`)} />
                        {errors.education?.[index]?.graduationYear && (
                          <p className="text-red-500 text-sm">{errors.education[index]?.graduationYear?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
