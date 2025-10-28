const express = require("express");
const {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionAnalytics,
  getInstitutionUsers,
} = require("../controllers/institutionController");
const { protect, authorize } = require("../controllers/authController");

const router = express.Router();

// 🔓 Public routes - Anyone can access
router.get("/", getInstitutions); // Get all institutions
router.get("/:id", getInstitution); // Get single institution

// 🔐 Protected routes - Require authentication
router.use(protect);

// 👑 Admin only routes
router.post("/", authorize("admin"), createInstitution); // Create institution
router.patch("/:id", authorize("admin"), updateInstitution); // Update institution
router.delete("/:id", authorize("admin"), deleteInstitution); // Delete institution

// 📊 Analytics & User routes - Admin or Institution Admin
router.get("/:id/analytics", getInstitutionAnalytics); // Get institution analytics
router.get("/:id/users", getInstitutionUsers); // Get institution users

module.exports = router;
