import express from "express";
import { loginUser, getUserProfile , logoutUser} from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", getUserProfile);
router.post("/user/logout", logoutUser);


export default router;
