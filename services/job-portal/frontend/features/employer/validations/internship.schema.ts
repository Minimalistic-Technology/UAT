import z from "zod";
import {
  JobType,
  WorkMode,
  CompanyType,
  RoleCategory,
  Industry,
  DegreeLevel,
  StipendType,
  DurationType,
} from "@/types";

// ─── Shared sub-schemas (reuse across job & internship) ───────────────────────

const locationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  remote: z.boolean().optional(),
});

const educationSchema = z.object({
  minimumDegree: z.nativeEnum(DegreeLevel).default(DegreeLevel.ANY),
  preferredFields: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
});

// ─── Internship-specific sub-schemas ─────────────────────────────────────────

const stipendSchema = z
  .object({
    type: z.nativeEnum(StipendType, {
      error: "Stipend type is required",
    }),
    amount: z.number().min(0, "Stipend amount cannot be negative").optional(),
    currency: z.string().default("INR"),
    period: z.enum(["monthly", "weekly"]).default("monthly"),
  })
  .refine(
    (data) =>
      data.type === StipendType.UNPAID || data.amount !== undefined,
    {
      message: "Stipend amount is required for paid internships",
      path: ["amount"],
    },
  );

const durationSchema = z.object({
  value: z
    .number({ error: "Duration is required" })
    .min(1, "Duration must be at least 1"),
  unit: z.nativeEnum(DurationType, {
    error: "Duration unit is required",
  }),
});

// ─── Main schema ──────────────────────────────────────────────────────────────

export const createInternshipSchema = z.object({
  // Base fields
  title: z
    .string({ error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters")
    .trim(),

  description: z
    .string({ error: "Description is required" })
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be under 5000 characters"),

  jobType: z.nativeEnum(JobType, {
    error: "Job type is required",
  }),

  workMode: z.nativeEnum(WorkMode, {
    error: "Work mode is required",
  }),

  companyType: z.nativeEnum(CompanyType, {
    error: "Company type is required",
  }),

  location: locationSchema,

  skills: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .max(20, "Maximum 20 skills allowed"),

  requirements: z
    .array(z.string())
    .min(1, "At least one requirement is required"),

  benefits: z.array(z.string()).optional(),

  applicationDeadline: z
    .string()
    .optional()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      "Application deadline must be in the future",
    ),

  openings: z
    .number()
    .min(1, "At least one opening is required")
    .default(1),

  isFeatured: z.boolean().default(false),

  roleCategory: z.nativeEnum(RoleCategory, {
    error: "Role category is required",
  }),

  industry: z.nativeEnum(Industry, {
    error: "Industry is required",
  }),

  education: educationSchema.optional(),

  // Internship-specific fields
  stipend: stipendSchema,

  duration: durationSchema,

  isPPO: z.boolean().default(false),

  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || new Date(val) >= new Date(),
      "Start date cannot be in the past",
    ),

  certificateProvided: z.boolean().default(true),
});

// ─── Type ─────────────────────────────────────────────────────────────────────

export type CreateInternshipFormData = z.infer<typeof createInternshipSchema>;