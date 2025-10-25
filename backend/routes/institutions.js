const express = require("express");
const {
  createInstitution,
  getInstitutionAnalytics,
  getInstitutions,
} = require("../controllers/institutionController");
const { protect } = require("../controllers/authController");

const router = express.Router();

// 🔓 Public routes
router.get("/", getInstitutions);

// 🔐 Protected routes
router.post("/", protect, createInstitution);
router.get("/:id/analytics", protect, getInstitutionAnalytics);

module.exports = router;
