import { z } from "zod";

const experienceSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    company: z.string().min(2, "Company must be at least 2 characters"),
    workType: z.enum(["wfo", "hybrid", "remote", "temporary_wfh"], {
      error: "Work type is required",
    }),
    location: z.string().optional(),
    current: z.boolean().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.workType === "remote" || !!data.location, {
    message: "Location is required unless work type is remote",
    path: ["location"],
  })
  .refine((data) => data.current || !!data.endDate, {
    message: "End date is required if this is not your current job",
    path: ["endDate"],
  });

const educationSchema = z.object({
  degree: z.string().min(2, "Degree must be at least 2 characters"),
  institution: z.string().min(2, "Institution must be at least 2 characters"),
  fieldOfStudy: z
    .string()
    .min(2, "Field of study must be at least 2 characters"),
  graduationYear: z.string().min(4, "Graduation year must be valid"),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
