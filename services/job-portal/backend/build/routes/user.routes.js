import express from "express";
import { updateProfile, uploadAvatar, uploadResume, getUserById, submitKyc, } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { submitKycSchema, updateProfileSchema, } from "../validations/user.validation.js";
import { avatarUpload, kycUpload, resumeUpload } from "../constants/index.js";
const router = express.Router();
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.put("/resume", protect, resumeUpload.single("resume"), uploadResume);
router.get("/:id", protect, getUserById);
router.post("/kyc", protect, kycUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "lightbill", maxCount: 1 },
]), validate(submitKycSchema), submitKyc);
export default router;
