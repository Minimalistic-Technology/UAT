import z from "zod";
import {
  Job_Type,
  Work_Mode,
  Company_Type,
  Experience_Level,
  ROLE_CATEGORIES,
  INDUSTRIES,
  Degree_Level,
  Listing_Status,
} from "./base-listing.schema";

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  description: z.string().trim().min(1, "Job description is required"),
  jobType: z.enum(Job_Type, { error: "Job type is required" }),
  workMode: z.enum(Work_Mode, { error: "Work mode is required" }),
  companyType: z.enum(Company_Type, { error: "Company type is required" }),
  roleCategory: z.enum(ROLE_CATEGORIES, { error: "Role category is required" }),
  industry: z.enum(INDUSTRIES, { error: "Industry is required" }),
  experienceLevel: z.enum(Experience_Level, {
    error: "Experience level is required",
  }),
  experienceInYears: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z
      .number({
        error: "Experience in years is required",
      })
      .int("Experience must be an integer")
      .min(0, "Experience cannot be negative"),
  ),
  openings: z.coerce.number().int().min(1, "Openings must be at least 1"),

  // Nested Location Object
  location: z.object({
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    country: z.string().trim().min(1, "Country is required"),
  }),

  // Education Details
  education: z.object({
    minimumDegree: z.enum(Degree_Level, {
      error: "Minimum degree is required",
    }),
    preferredFields: z
      .array(z.string().trim().min(1, "Preferred field cannot be empty"))
      .optional(),
    isRequired: z.boolean().default(false),
  }),

  // Nested Salary Object
  salary: z
    .object({
      min: z.preprocess(
        (val) =>
          val === "" ||
          val === undefined ||
          val === null ||
          (typeof val === "number" && Number.isNaN(val))
            ? undefined
            : Number(val),
        z.number().min(0, "Min salary must be positive").optional(),
      ),
      max: z.preprocess(
        (val) =>
          val === "" ||
          val === undefined ||
          val === null ||
          (typeof val === "number" && Number.isNaN(val))
            ? undefined
            : Number(val),
        z.number().min(0, "Max salary must be positive").optional(),
      ),
      currency: z.string().min(1, "Currency is required").default("USD"),
      period: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
    })
    .refine(
      (data) => {
        if (data.min && data.max) {
          return data.max >= data.min;
        }
        return true;
      },
      {
        message: "Max salary cannot be less than min salary",
        path: ["max"], // Highlights the max field in the form
      },
    ),

  // Arrays
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  requirements: z
    .array(z.string().trim().min(1, "Requirement cannot be empty"))
    .min(1, "At least one requirement is required"),
  benefits: z.array(z.string()).optional(),

  // Dates & Status
  applicationDeadline: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (!val) return undefined;
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date" });
        return z.NEVER;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Deadline cannot be in the past",
        });
        return z.NEVER;
      }
      return date;
    }),
  isFeatured: z.boolean().default(false),
  status: z.enum(Listing_Status).default("active"),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;