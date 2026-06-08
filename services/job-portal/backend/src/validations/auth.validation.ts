import { body } from "express-validator";

export const registerUserSchema = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6, max: 30 })
    .withMessage("Password must be between 6 and 30 characters"),
  body("captchaToken").notEmpty().withMessage("Captcha is required"),
];

export const registerEmployerSchema = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6, max: 30 })
    .withMessage("Password must be between 6 and 30 characters"),
  body("role")
    .isIn(["owner", "admin", "recruiter"])
    .withMessage("Invalid role"),
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("industry").trim().notEmpty().withMessage("Industry is required"),
  body("captchaToken").notEmpty().withMessage("Captcha is required"),
];

export const confirmRegistrationSchema = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

export const loginSchema = [
  body("email").isEmail().withMessage("Valid email is required"),
  body('password').notEmpty().withMessage('Password is required')
];

export const resetPasswordSchema = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export const forgotPasswordSchema = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const googleAuthSchema = [
  body("token").notEmpty().withMessage("Google token is required"),
];

export const verifyOtpSchema = [
  body("phone")
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("otp")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits"),
];

export const resendRegistrationOtpSchema = [
  body("email").isEmail().withMessage("Valid email is required"),
];
