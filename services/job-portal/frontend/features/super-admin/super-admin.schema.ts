
import z from "zod"

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  price: z.number({ error: "Price must be a number" }).min(0, "Price cannot be negative"),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  durationDays: z
    .number({ error: "Duration must be a number" })
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 day"),
  jobPostLimit: z
    .number({ error: "Job post limit must be a number" })
    .int("Job post limit must be a whole number")
    .min(-1, "Use -1 for unlimited, or a positive number"),
  features: z.array(
    z.object({
      value: z.string().min(1, "Feature description is required"),
    })
  ),
  isFeatured: z.boolean(),
  isDefault: z.boolean(),
  displayOrder: z.number({ error: "Display order must be a number" }).int().min(0),
  isActive: z.boolean(),
});

export const couponSchema = z
  .object({
    code: z.string().min(3, "Coupon code must be at least 3 characters").toUpperCase(),
    type: z.enum(["percentage", "amount"]),
    value: z
      .number({ error: "Value must be a number" })
      .min(0, "Value cannot be negative"),
    isActive: z.boolean(),
    expiryDate: z.string().optional(),
    maxUses: z
      .number({ error: "Max uses must be a number" })
      .int("Max uses must be a whole number")
      .min(1, "Max uses must be at least 1")
      .optional(),
  })
  .refine(
    (data) => !(data.type === "percentage" && data.value > 100),
    { message: "Percentage discount cannot exceed 100%", path: ["value"] }
  );

export type CouponFormValues = z.infer<typeof couponSchema>;
export type PlanFormValues = z.infer<typeof planSchema>;