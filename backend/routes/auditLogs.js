import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { protect, authorize } from "../controllers/authController.js";

const router = express.Router();

// Only super admins can view audit logs
router.get("/", protect, authorize("admin"), getAuditLogs);

export default router;
