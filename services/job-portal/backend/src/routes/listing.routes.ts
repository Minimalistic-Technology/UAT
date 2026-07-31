import express from "express";
import { getListings } from "../controllers/listing.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", optionalAuth, getListings);

export default router;
