// routes/users.js
import express from "express";
import { protect, authorize } from "../controllers/authController.js";
import {
  getUsers,
  // getUserbaseUrl,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUsersByRole,
} from "../controllers/userController.js";
import {
  getMySettings,
  updateProfile,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateCourseDefaults,
  changePassword,
} from "../controllers/settingsController.js";

const router = express.Router();

// All user routes are protected
router.use(protect);

// Settings routes MUST come before /:id to avoid treating "settings" as an ID
router.get("/settings", getMySettings);
router.patch("/settings/profile", authorize("instructor", "admin"), updateProfile);
router.patch("/settings/notifications", authorize("instructor", "admin"), updateNotificationPreferences);
router.patch("/settings/privacy", authorize("instructor", "admin"), updatePrivacySettings);
router.patch("/settings/course-defaults", authorize("instructor", "admin"), updateCourseDefaults);
router.patch("/settings/password", changePassword);

// User CRUD routes
router.get("/", getUsers);
router.get("/:id", getUser);
// router.get("/:role", getUsersByRole);
router.get("/role/:role", getUsersByRole); // Temporarily public for dev
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/role", updateUserRole);

export default router;
