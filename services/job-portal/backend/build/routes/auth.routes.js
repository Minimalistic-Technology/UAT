import { Router } from "express";
import { register, login, logout, getMe, verifyOTP, googleAuth, } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";
const router = Router();
// Register
router.post("/register", validate([
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("role").isIn(["jobseeker", "employer"]).withMessage("Invalid role"),
]), register);
// Login
router.post("/login", validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
]), login);
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
router.post("/verify-otp", validate([
    body("phone").isMobilePhone("any").withMessage("Valid phone number is required"),
    body("otp").isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 digits"),
]), verifyOTP);
// Google Auth
router.post("/google-auth", validate([body("token").notEmpty().withMessage("Google token is required")]), googleAuth);
export default router;
