import express from 'express';
import { protect, authorize } from '../controllers/authController.js';
import {
    getMyAssignments,
    getAssignment,
    submitAssignment,
    getMySubmission
} from '../controllers/studentAssignmentController.js';

const router = express.Router();

// All routes require authentication and student/user role
router.use(protect);
router.use(authorize('user'));

// Assignment routes
router.get('/', getMyAssignments);
router.get('/:assignmentId', getAssignment);
router.post('/:assignmentId/submit', submitAssignment);
router.get('/:assignmentId/submission', getMySubmission);

export default router;
