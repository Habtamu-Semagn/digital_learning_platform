import express from "express";
import { protect, authorize } from "../controllers/authController.js";
import {
    getMySettings,
    updateProfile,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateCourseDefaults,
    changePassword,
} from "../controllers/settingsController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Settings routes - these must come BEFORE the /:id route to avoid conflicts
router.get("/settings", getMySettings);
router.patch("/settings/profile", authorize("instructor", "admin"), updateProfile);
router.patch("/settings/notifications", authorize("instructor", "admin"), updateNotificationPreferences);
router.patch("/settings/privacy", authorize("instructor", "admin"), updatePrivacySettings);
router.patch("/settings/course-defaults", authorize("instructor", "admin"), updateCourseDefaults);
router.patch("/settings/password", changePassword);

export default router;
