import express from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../../controllers/teams/teamController";

const router = express.Router();

router.post("/create-team-member", createTeamMember);
router.post("/get-team-members", getAllTeamMembers);
router.post("/get-member-by-id", getTeamMemberById);
router.put("/update-team-member", updateTeamMember);
router.post("/delete-team-member", deleteTeamMember);

export default router;
