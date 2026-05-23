import z from "zod";
import { ExperienceLevel, JobType } from "@/types";

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  description: z.string().trim().min(1, "Job description is required"),
  jobType: z.enum(JobType),
  experienceLevel: z.enum(ExperienceLevel),
  openings: z.coerce.number().int().min(1, "Openings must be at least 1"),

  // Nested Location Object
  location: z.object({
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    country: z.string().trim().min(1, "Country is required"),
    remote: z.boolean().default(false),
  }),

  // Nested Salary Object
  salary: z.object({
    min: z.coerce.number().min(0, "Min salary must be positive").optional(),
    max: z.coerce.number().min(0, "Max salary must be positive").optional(),
    currency: z.string().min(1, "Currency is required").default("USD"),
    period: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
  }).refine((data) => {
    if (data.min && data.max) {
      return data.max >= data.min;
    }
    return true;
  }, {
    message: "Max salary cannot be less than min salary",
    path: ["max"], // Highlights the max field in the form
  }),

  // Arrays
  skills: z.array(z.string().trim().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  requirements: z.array(z.string().trim().min(1, "Requirement cannot be empty"))
    .min(1, "At least one requirement is required"),
  benefits: z.array(z.string()).optional(),

  // Dates & Status
  applicationDeadline: z.coerce.date().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(["open", "closed", "draft"]).default("open"),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;