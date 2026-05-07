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
import { addMemberToCompanySchema } from "../validations/company-member.validation.js";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.USER));

router.get("/all", getAllCompanyMembers);
router.post("/", validate(addMemberToCompanySchema), addMember);
router.patch("/:memberId", updateMember);
router.delete("/:memberId", removeMember);

export default router;
