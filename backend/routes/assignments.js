import express from "express";
import { protect, authorize } from "../controllers/authController.js";
import {
    getAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
    getSubmissions,
    gradeSubmission,
} from "../controllers/assignmentController.js";

const router = express.Router();

// Assignment routes
router.get("/", protect, getAssignments);
router.get("/:id", protect, getAssignment);
router.post("/", protect, authorize("instructor", "admin"), createAssignment);
router.patch("/:id", protect, authorize("instructor", "admin"), updateAssignment);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteAssignment);
router.patch("/:id/publish", protect, authorize("instructor", "admin"), publishAssignment);

// Submission routes
router.get("/:id/submissions", protect, authorize("instructor", "admin"), getSubmissions);
router.patch(
    "/:id/submissions/:submissionId/grade",
    protect,
    authorize("instructor", "admin"),
    gradeSubmission
);

export default router;
