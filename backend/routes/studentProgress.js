import express from 'express';
import { protect, authorize } from '../controllers/authController.js';
import { getMyProgress, updateProgress } from '../controllers/progressController.js';

const router = express.Router();

// All routes require authentication and student/user role
router.use(protect);
router.use(authorize('user'));

// Progress routes
router.get('/', getMyProgress);
router.post('/', updateProgress);

export default router;
