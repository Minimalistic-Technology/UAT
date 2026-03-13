import { CompanyRole } from "@/types";
import z from "zod";

export const employerRegisterSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password at max can have 30 characters"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password at max can have 30 characters"),
  phone: z.string().optional(),
  role: z.enum([CompanyRole.OWNER]).default(CompanyRole.OWNER),
});

export type EmployerRegisterInput = z.infer<typeof employerRegisterSchema>;
