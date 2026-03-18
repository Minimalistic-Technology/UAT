import { CompanyRole } from "@/types";
import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];


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

export const kycSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  aadharNo: z.string().regex(/^\d{12}$/, "Aadhar Number must be exactly 12 digits"),
  gstNo: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format"),
  cinNo: z.string().regex(/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, "Invalid CIN format"),
  photo: z
    .any()
    .refine((files) => files?.length === 1, "User Photo is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  lightbill: z
    .any()
    .refine((files) => files?.length === 1, "Lightbill/Address Proof is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_DOC_TYPES.includes(files?.[0]?.type),
      "Only PDF and Images are supported for the lightbill."
    )
});

export type EmployerRegisterInput = z.infer<typeof employerRegisterSchema>;
export type KYCFormValues = z.infer<typeof kycSchema>;
