import { Router } from "express";
import {
  handleUserLogin,
  handleUserRegister,
  handleVerifyOTP,
  handleRefreshToken,
  handleLogout,
} from "../../controllers/auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", handleUserRegister);
authRouter.post("/verify-otp", handleVerifyOTP);
authRouter.post("/login", handleUserLogin);
authRouter.post("/refresh-token", handleRefreshToken);
authRouter.post("/logout", verifyJWT, handleLogout);

export default authRouter;