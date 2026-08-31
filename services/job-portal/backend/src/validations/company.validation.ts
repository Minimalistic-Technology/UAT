import { body, param } from "express-validator";

export const createCompanySchema = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Owner first name is required"),
  body("lastName").trim().notEmpty().withMessage("Owner last name is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone").trim().optional(),

  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("companyDescription")
    .trim()
    .notEmpty()
    .withMessage("Company description is required"),
  body("industry").trim().notEmpty().withMessage("Industry is required"),
];

export const deleteCompanySchema = [
  param("id").isUUID().withMessage("Invalid company ID"),
];
