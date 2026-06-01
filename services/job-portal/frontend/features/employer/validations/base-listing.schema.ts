import z from "zod";

export const Listing_Status = ["active", "closed", "pending", "rejected"];

export const Job_Type = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
];

export const Work_Mode = [
  "work from office",
  "remote",
  "hybrid",
  "temporary work from home",
];

export const Company_Type = [
  "startup",
  "mnc",
  "foreign mnc",
  "indian mnc",
  "corporate",
  "govt/psu",
  "others",
];

export const Experience_Level = ["entry", "intermediate", "senior", "expert"];

export const ROLE_CATEGORIES = [
  "software_development",
  "data_science",
  "devops",
  "cybersecurity",
  "it_support",
  "qa_testing",
  "hardware",
  "ui_ux",
  "graphic_design",
  "product_design",
  "product_management",
  "project_management",
  "business_analysis",
  "operations",
  "consulting",
  "sales",
  "digital_marketing",
  "content",
  "seo_sem",
  "brand_management",
  "finance",
  "accounting",
  "legal",
  "compliance",
  "human_resources",
  "recruitment",
  "administration",
  "customer_support",
  "research",
  "other",
];

export const INDUSTRIES = [
  "information_technology",
  "software",
  "ecommerce",
  "fintech",
  "edtech",
  "healthtech",
  "banking",
  "insurance",
  "healthcare",
  "education",
  "manufacturing",
  "retail",
  "real_estate",
  "logistics",
  "automotive",
  "energy",
  "telecom",
  "media",
  "entertainment",
  "hospitality",
  "agriculture",
  "government",
  "nonprofit",
  "other",
];

export const Degree_Level = [
  "high_school",
  "diploma",
  "bachelors",
  "masters",
  "phd",
  "any",
];

const locationSchema = z.object({
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
}).optional();

const educationSchema = z.object({
  minimumDegree: z.enum(Degree_Level, {
    error: "Minimum degree is required",
  }),
  preferredFields: z
    .array(z.string().trim().min(1, "Preferred field cannot be empty"))
    .optional(),
  isRequired: z.boolean().default(false),
});

const applicationDeadlineSchema = z
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
  });

export const BaseListingSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  description: z.string().trim().min(1, "Job description is required"),

  // Select values
  jobType: z.enum(Job_Type, { error: "Job type is required" }),
  workMode: z.enum(Work_Mode, { error: "Work mode is required" }),
  companyType: z.enum(Company_Type, { error: "Company type is required" }),
  roleCategory: z.enum(ROLE_CATEGORIES, { error: "Role category is required" }),
  industry: z.enum(INDUSTRIES, { error: "Industry is required" }),

  location: locationSchema,
  education: educationSchema,

  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  requirements: z
    .array(z.string().trim().min(1, "Requirement cannot be empty"))
    .min(1, "At least one requirement is required"),
  benefits: z.array(z.string()).optional(),

  applicationDeadline: applicationDeadlineSchema,
  openings: z.coerce.number().int().min(1, "Openings must be at least 1"),
  status: z.enum(Listing_Status).default("active"),
  isFeatured: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.workMode !== "remote") {
    if (!data.location?.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "city"],
        message: "City is required for non-remote roles",
      });
    }
    if (!data.location?.state) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "state"],
        message: "State is required for non-remote roles",
      });
    }
    if (!data.location?.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "country"],
        message: "Country is required for non-remote roles",
      });
    }
  }
});
