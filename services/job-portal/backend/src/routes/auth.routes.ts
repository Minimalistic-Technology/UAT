import { Router } from "express";
import {
  login,
  logout,
  getMe,
  verifyOTP,
  googleAuth,
  forgotPassword,
  resetPassword,
  requestUserRegistration,
  requestEmployerRegistration,
  confirmRegistrationOTP,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = Router();

// Register
router.post(
  "/request-otp/register",
  validate([
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6, max: 30 })
      .withMessage("Password must be between 6 and 30 characters"),
  ]),
  requestUserRegistration,
);

// Register Employer
router.post(
  "/request-otp/employer",
  validate([
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6, max: 30 })
      .withMessage("Password must be between 6 and 30 characters"),
    body("role")
      .isIn(["owner", "admin", "recruiter"])
      .withMessage("Invalid role"),
    body("companyName")
      .trim()
      .notEmpty()
      .withMessage("Company name is required"),
    body("industry").trim().notEmpty().withMessage("Industry is required"),
  ]),
  requestEmployerRegistration,
);

// confirm registration
router.post(
  "/register/confirm",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ]),
  confirmRegistrationOTP,
);

// Login
router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ]),
  login,
);

// Logout
router.post("/logout", protect, logout);

// Get current user
router.get("/me", protect, getMe);

// Send Phone OTP
// router.post(
//   "/send-phone-otp",
//   validate([body("phone").isMobilePhone("any").withMessage("Valid phone number is required")]),
//   sendPhoneOTP
// );

// Verify OTP
router.post(
  "/verify-otp",
  validate([
    body("phone")
      .isMobilePhone("any")
      .withMessage("Valid phone number is required"),
    body("otp")
      .isLength({ min: 4, max: 6 })
      .withMessage("OTP must be 4-6 digits"),
  ]),
  verifyOTP,
);

// Google Auth
router.post(
  "/google-auth",
  validate([body("token").notEmpty().withMessage("Google token is required")]),
  googleAuth,
);

// Forgot Password
router.post(
  "/forgot-password",
  validate([body("email").isEmail().withMessage("Valid email is required")]),
  forgotPassword,
);

// Reset Password
router.post(
  "/reset-password/:token",
  validate([
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ]),
  resetPassword,
);

export default router;
