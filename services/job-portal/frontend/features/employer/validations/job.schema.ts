import z from "zod";
import { Experience_Level, BaseListingSchema } from "./base-listing.schema";

const salarySchema = z
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
  );

export const createJobSchema = BaseListingSchema.and(
  z.object({
    experienceLevel: z.enum(Experience_Level, {
      required_error: "Experience level is required",
    }),
    experienceInYears: z.preprocess(
      (val) =>
        val === "" ||
        val === undefined ||
        val === null ||
        (typeof val === "number" && Number.isNaN(val))
          ? undefined
          : Number(val),
      z
        .number({
          invalid_type_error: "Experience in years is required",
          required_error: "Experience in years is required",
        })
        .int("Experience must be an integer")
        .min(0, "Experience cannot be negative"),
    ),
    salary: salarySchema,
  }),
);

export type CreateJobFormData = z.infer<typeof createJobSchema>;
