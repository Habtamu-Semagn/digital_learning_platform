import express from "express";
import {
  trackEvent,
  getOverview,
  getInstitutionAnalytics,
  getUserAnalytics,
  exportAnalytics,
  getInstructorStats,
} from "../controllers/analyticsController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// All analytics routes are protected
router.post("/track", protect, trackEvent);
router.get("/overview", protect, getOverview);
router.get("/institution/:institutionId", protect, getInstitutionAnalytics);
router.get("/user/:userId", protect, getUserAnalytics);
router.get("/instructor", protect, getInstructorStats);
router.get("/export", protect, exportAnalytics);

export default router;