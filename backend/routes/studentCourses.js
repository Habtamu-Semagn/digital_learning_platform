import express from 'express';
import { protect, authorize } from '../controllers/authController.js';
import {
    getEnrolledCourses,
    getAvailableCourses,
    enrollInCourse,
    unenrollFromCourse,
    getCourseDetail
} from '../controllers/studentCourseController.js';

const router = express.Router();

// All routes require authentication and student/user role
router.use(protect);
router.use(authorize('user'));

// Course routes
router.get('/enrolled', getEnrolledCourses);
router.get('/available', getAvailableCourses);
router.post('/:courseId/enroll', enrollInCourse);
router.delete('/:courseId/unenroll', unenrollFromCourse);
router.get('/:courseId', getCourseDetail);

export default router;
