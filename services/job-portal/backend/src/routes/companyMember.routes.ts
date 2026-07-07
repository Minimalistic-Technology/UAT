import { Router } from "express";
import {
  addMember,
  getAllCompanyMembers,
  removeMember,
  updateMember,
  getCompanyMemberById
} from "../controllers/companyMember.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../../generated/prisma/client.js";
import { validate } from "../middleware/validate.middleware.js";
import { addMemberToCompanySchema, updateMemberSchema } from "../validations/company-member.validation.js";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.USER));

// Only company owners can access this routes
router.get("/all", getAllCompanyMembers); 
router.get("/:memberId", getCompanyMemberById);
router.post("/", validate(addMemberToCompanySchema), addMember);
router.patch("/:memberId", validate(updateMemberSchema), updateMember);
router.delete("/:memberId", removeMember);

export default router;
