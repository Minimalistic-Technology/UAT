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
import {
  confirmRegistrationSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  registerEmployerSchema,
  registerUserSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Register
router.post(
  "/request-otp/register",
  validate(registerUserSchema),
  requestUserRegistration,
);

// Register Employer
router.post(
  "/request-otp/employer",
  validate(registerEmployerSchema),
  requestEmployerRegistration,
);

// confirm registration
router.post(
  "/register/confirm",
  validate(confirmRegistrationSchema),
  confirmRegistrationOTP,
);

// Login
router.post("/login", validate(loginSchema), login);

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
router.post("/verify-otp", validate(verifyOtpSchema), verifyOTP);

// Google Auth
router.post("/google-auth", validate(googleAuthSchema), googleAuth);

// Forgot Password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// Reset Password
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
