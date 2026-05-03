"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/use-user";
import { User, Experience } from "@/types";
import { ProfileFormValues, profileSchema } from "@/validations";
import { BasicInfoTab } from "./_components/basic-info-tab";
import { SkillsLanguagesTab } from "./_components/skills-languages-tab";
import { ExperienceTab } from "./_components/experience-tab";
import { EducationTab } from "./_components/education-tab";

interface EditProfileDialogProps {
  user: User | null;
  children: React.ReactNode;
}

export const EditProfileDialog = ({ user, children }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const methods = useForm<ProfileFormValues>({
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

  useEffect(() => {
    if (user && open) {
      methods.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        location: {
          city: user.location?.city || "",
          state: user.location?.state || "",
          country: user.location?.country || "",
        },
        skills: user.skills || [],
        languages: user.languages || [],
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
  }, [user, open, methods]);

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      ...data,
      skills: data.skills,
      languages: data.languages,
      experience: data.experience?.map(e => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined
      })) as Experience[],
    } as any;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="skills">Skills & Languages</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>

              <BasicInfoTab />
              <SkillsLanguagesTab />
              <ExperienceTab />
              <EducationTab />
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
