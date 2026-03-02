import { Router } from "express";
import {
  addMember,
  getAllCompanyMembers,
  removeMember,
  updateMember,
} from "../controllers/companyMember.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = Router();

const addMemberValidation = validate([
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")]);

router.use(protect);
router.use(authorize(GlobalRole.USER));

router.get("/all", getAllCompanyMembers);
router.post("/", addMemberValidation, addMember);
router.patch("/:memberId", updateMember);
router.delete("/:memberId", removeMember);

export default router;
