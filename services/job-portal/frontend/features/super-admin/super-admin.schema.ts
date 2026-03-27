
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