import { GlobalRole } from "@/types";
import z from "zod";

export const registerUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .nonoptional("Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password at max can have 30 characters"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password at max can have 30 characters"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  role: z.enum([GlobalRole.USER]).default(GlobalRole.USER),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUserInput = z.infer<typeof loginSchema>;
