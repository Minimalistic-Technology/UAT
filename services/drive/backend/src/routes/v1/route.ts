import { Router } from "express";
import authRouter from "./auth.route";
import driveRouter from "./drive.route"
import { verifyJWT } from "../../middleware/auth.middleware";

const V1Router = Router();

V1Router.use("/auth", authRouter);
V1Router.use("/drive", verifyJWT, driveRouter);

export default V1Router;