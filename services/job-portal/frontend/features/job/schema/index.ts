import z from "zod";
import { JobType, ExperienceLevel } from "@/types";

export const createJobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  jobType: z.nativeEnum(JobType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  locationCity: z.string().min(2, "City is required"),
  locationCountry: z.string().min(2, "Country is required"),
  remote: z.boolean(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default("USD"),
  salaryPeriod: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  benefits: z.string().optional(),
  openings: z.number().min(1, "Minimum 1 opening is required").default(1),
});

export type CreateJobFormData = z.input<typeof createJobSchema>;
export type CreateJobOutput = z.output<typeof createJobSchema>;