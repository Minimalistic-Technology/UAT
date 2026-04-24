import z from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().optional(),
  location: z.object({
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
  }).optional(),
  skills: z.array(
    z.object({ value: z.string().trim().min(1, "Skill cannot be empty") })
  ).optional(),
  languages: z.array(
    z.object({ value: z.string().trim().min(1, "Language cannot be empty") })
  ).optional(),
  experience: z.array(
    z.object({
      title: z.string().trim().min(1, "Title is required"),
      company: z.string().trim().min(1, "Company is required"),
      location: z.string().trim().optional(),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().optional(),
      current: z.boolean().default(false),
      description: z.string().trim().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      degree: z.string().trim().min(1, "Degree is required"),
      institution: z.string().trim().min(1, "Institution is required"),
      graduationYear: z.preprocess((val) => Number(val) || 0, z.number().min(1900, "Year must be after 1900").max(2100, "Year must be before 2100")),
      fieldOfStudy: z.string().trim().optional(),
    })
  ).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;