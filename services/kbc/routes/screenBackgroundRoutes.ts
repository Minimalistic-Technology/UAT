import express from "express";
import multer from "multer";
import {
    createOrUpdateScreenBackground,
    getScreenBackground,
    getAllScreenBackgrounds,
} from "../controllers/screenBackgroundController";

const router = express.Router();
const upload = multer(); // Memory storage

// GET /api/screen-background -> Get all backgrounds
router.get("/", getAllScreenBackgrounds);

// GET /api/screen-background/:screenName -> Get specific background
router.get("/:screenName", getScreenBackground);

// POST /api/screen-background/:screenName -> Create or update background
// Expects form-data with key 'file' (the image)
router.post(
    "/:screenName",
    upload.single("file"),
    createOrUpdateScreenBackground
);

export default router;
