import express from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamController";

const router = express.Router();

router.post("/create", createTeamMember);
router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);
router.put("/update/:id", updateTeamMember);
router.delete("/delete/:id", deleteTeamMember);

export default router;
