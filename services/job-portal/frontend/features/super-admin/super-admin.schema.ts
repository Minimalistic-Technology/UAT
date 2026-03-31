
import z from "zod"

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.number({ message: "Price must be a number" }).min(0, "Price cannot be negative"),
  durationDays: z.number({ message: "Duration must be a number" }).min(1, "Duration must be at least 1 day"),
  features: z.array(
    z.object({
      value: z.string().min(1, "Feature description is required"),
    })
  ),
  isActive: z.boolean(),
});

export type PlanFormValues = z.infer<typeof planSchema>;

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