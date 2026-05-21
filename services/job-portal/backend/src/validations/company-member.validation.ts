import { body, param } from "express-validator";

export const addMemberToCompanySchema = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const updateMemberSchema = [
  body("firstName").optional().trim().notEmpty().withMessage("First name is required"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name is required"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];