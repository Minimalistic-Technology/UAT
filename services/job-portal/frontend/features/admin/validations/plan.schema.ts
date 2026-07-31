import z from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  price: z
    .number({ message: "Price must be an integer" })
    .min(0, "Price cannot be negative"),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  subscriptionDurationDays: z
    .number({ message: "Duration must be an integer" })
    .min(-1, "Duration must be at least 1 day"),
  maxActiveJobPosts: z
    .number({ message: "Job post limit must be an integer" })
    .min(-1, "Use -1 for unlimited, or a positive number"),
  maxTeamMembers: z
    .number({ message: "Team member limit must be an integer" })
    .min(-1, "Use -1 for unlimited, or a positive number"),
  features: z.array(z.string()),
  isDefault: z.boolean(),
  displayOrder: z
    .number({ message: "Display order must be a number" })
    .min(0, "Display order cannot be negative"),
  isActive: z.boolean(),
  allowResumeDownload: z.boolean({
    message: "allowResumeDowload field is required",
  }),
  jobPostValidityDays: z
    .number({ message: "Post Validity Days must be a number" })
    .min(1, { message: "Post Validity Days should be atleast 1" }),
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;
