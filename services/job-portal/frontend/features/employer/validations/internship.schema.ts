import z from "zod";
import { BaseListingSchema } from "./base-listing.schema";

const Duration_Type = ["weeks", "months"] as const;
const Stipend_Type = ["fixed", "performance_based", "unpaid"] as const;

const stipendSchema = z
  .object({
    type: z.enum(Stipend_Type, {
      required_error: "Stipend type is required",
    }),
    amount: z.preprocess(
      (val) =>
        val === "" ||
        val === undefined ||
        val === null ||
        (typeof val === "number" && Number.isNaN(val))
          ? undefined
          : Number(val),
      z.number().min(0, "Stipend amount cannot be negative").optional(),
    ),
    currency: z.string().default("INR"),
    period: z.enum(["monthly", "weekly"]).default("monthly"),
  })
  .refine((data) => data.type === "unpaid" || data.amount !== undefined, {
    message: "Stipend amount is required for paid internships",
    path: ["amount"],
  });

const durationSchema = z.object({
  value: z.preprocess(
    (val) =>
      val === "" ||
      val === undefined ||
      val === null ||
      (typeof val === "number" && Number.isNaN(val))
        ? undefined
        : Number(val),
    z
      .number({
        invalid_type_error: "Duration is required",
        required_error: "Duration is required",
      })
      .min(1, "Duration must be at least 1"),
  ),
  unit: z.enum(Duration_Type, {
    required_error: "Duration unit is required",
  }),
});

export const createInternshipSchema = BaseListingSchema.and(
  z.object({
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
  }),
);

export type CreateInternshipFormData = z.infer<typeof createInternshipSchema>;
