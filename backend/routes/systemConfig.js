import express from "express";
import { getSystemConfig, updateSystemConfig } from "../controllers/systemConfigController.js";
import { protect, authorize } from "../controllers/authController.js";

const router = express.Router();

// Public route (optional, if you want to expose site name etc. publicly)
// router.get("/public", getPublicSystemConfig);

// Protected routes
router.get("/", protect, authorize("admin"), getSystemConfig);
router.patch("/", protect, authorize("admin"), updateSystemConfig);

export default router;
