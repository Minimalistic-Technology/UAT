import express from "express";
import { bookDemo } from "../controllers/demo.controller.js";

const router = express.Router();

router.post("/book", bookDemo);

export default router;
