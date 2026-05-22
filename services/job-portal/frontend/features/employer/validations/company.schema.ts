import z from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().min(2, "Industry is required"),
  companySize: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().min(3, "Zip code must be at least 3 characters").max(10, "Zip code cannot exceed 10 characters").optional(),
  }).optional(),
  socialLinks: z.object({
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }).optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;