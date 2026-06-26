import z from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters long")
    .max(15, "First name must be at most 15 characters long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters long")
    .max(15, "Last name must be at most 15 characters long"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional(),
  location: z
    .object({
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
  skills: z.array(z.string().trim()).optional(),
  languages: z.array(z.string().trim()).optional(),
  experience: z
    .array(
      z
        .object({
          title: z.string().trim().min(3, "Title is required"),
          company: z.string().trim().min(3, "Company is required"),
          workType: z.enum(["wfo", "hybrid", "remote", "temporary_wfh"], {
            required_error: "Work type is required",
          }),
          location: z.string().trim().optional(),
          startDate: z.string().min(1, "Start date is required"),
          endDate: z.string().optional(),
          current: z.boolean().optional(),
          description: z.string().trim().optional(),
        })
        .refine(
          (data) => {
            if (data.workType === "remote") return true;
            return data.location && data.location.trim().length >= 3;
          },
          {
            message: "Location is required unless work type is remote",
            path: ["location"],
          },
        ),
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1, "Degree is required"),
        institution: z.string().trim().min(1, "Institution is required"),
        graduationYear: z
          .number()
          .min(1900, "Year must be after 1900")
          .max(2100, "Year must be before 2100"),
        fieldOfStudy: z.string().trim().optional(),
      }),
    )
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
