import express from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../../controllers/teams/teamController";

const router = express.Router();

router.post("/team", createTeamMember);
router.get("/team", getAllTeamMembers);
router.get("/team/:id", getTeamMemberById);
router.put("/team/:id", updateTeamMember);
router.delete("/team/:id", deleteTeamMember);

export default router;
