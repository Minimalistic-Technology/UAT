import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    toggleBlockNotifications,
    getNotificationPreference,
    requireNotificationFeature
} from "../controllers/notification.controller.js";

const router = express.Router();

// All notification routes should be protected and feature-flagged
router.use(protect);
router.use(requireNotificationFeature);

router.get("/", getNotifications);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);

// "block un block val ok"
router.get("/preference", getNotificationPreference);
router.post("/preference/toggle", toggleBlockNotifications);

export default router;
