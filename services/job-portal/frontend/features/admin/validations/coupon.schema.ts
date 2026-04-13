import z from "zod";

export const couponSchema = z
    .object({
        code: z
            .string()
            .min(3, "Coupon code must be at least 3 characters")
            .toUpperCase(),
        type: z.enum(["percentage", "amount"]),
        value: z
            .number({ error: "Value must be a number" })
            .min(0, "Value cannot be negative"),
        isActive: z.boolean(),
        expiryDate: z.string().optional(),
        maxUses: z
            .number({ message: "Max uses is required and it must be a number" })
            .int("Max uses must be a whole number")
            .refine((val) => val === -1 || val >= 1, {
                message: "Max uses must be either -1 (unlimited) or at least 1",
            })
            .optional(),
    })
    .refine((data) => !(data.type === "percentage" && data.value > 100), {
        message: "Percentage discount cannot exceed 100%",
        path: ["value"],
    });

export type CouponFormValues = z.infer<typeof couponSchema>;
