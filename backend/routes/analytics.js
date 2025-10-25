const express = require("express");
const {
  trackEvent,
  getOverview,
  getInstitutionAnalytics,
  getUserAnalytics,
  exportAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../controllers/authController");

const router = express.Router();

// 🔐 All analytics routes are protected
router.post("/track", protect, trackEvent);
router.get("/overview", protect, getOverview);
router.get("/institution/:institutionId", protect, getInstitutionAnalytics);
router.get("/user/:userId", protect, getUserAnalytics);
router.get("/export", protect, exportAnalytics);

module.exports = router;
