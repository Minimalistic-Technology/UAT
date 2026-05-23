import z from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z
    .number({ message: "Price must be an integer" })
    .min(0, "Price cannot be negative"),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  durationDays: z
    .number({ message: "Duration must be an integer" })
    .min(-1, "Duration must be at least 1 day"),
  jobPostLimit: z
    .number({ message: "Job post limit must be an integer" })
    .min(-1, "Use -1 for unlimited, or a positive number"),
  teamMemberLimit: z
    .number({ message: "Team member limit must be an integer" })
    .min(-1, "Use -1 for unlimited, or a positive number"),
  features: z.array(z.string().min(1, "Feature description is required")),
  isFeatured: z.boolean(),
  isDefault: z.boolean(),
  displayOrder: z
    .number({ message: "Display order must be a number" })
    .min(0, "Display order cannot be negative"),
  isActive: z.boolean(),
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;