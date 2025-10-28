import express from "express";
import {
  createInstitution,
  getInstitutionAnalytics,
  getInstitutions,
} from "../controllers/institutionController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// 🔓 Public routes
router.get("/", getInstitutions);

// 🔐 Protected routes
router.post("/", protect, createInstitution);
router.get("/:id/analytics", protect, getInstitutionAnalytics);

module.exports = router;
