import User from '../models/User.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

// Get enrolled courses
export const getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'enrolledCourses.course',
                select: 'title description instructor thumbnail category lessons createdAt',
                populate: { path: 'instructor', select: 'name email' }
            });

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Filter active enrollments and format
        const courses = user.enrolledCourses
            .filter(enrollment => enrollment.course && enrollment.status === 'active')
            .map(enrollment => ({
                ...enrollment.course.toObject(),
                enrolledAt: enrollment.enrolledAt,
                enrollmentProgress: enrollment.progress,
                lastAccessedAt: enrollment.lastAccessedAt
            }));

        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get available courses (all published courses)
export const getAvailableCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            status: 'published' // Show all published courses
        })
            .select('title description instructor thumbnail category lessons createdAt')
            .populate('instructor', 'name email')
            .sort('-createdAt');
        console.log("courses: ", courses)
        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Enroll in course
export const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                status: 'fail',
                message: 'Course not found'
            });
        }

        const user = await User.findById(req.user.id);

        // Check if already enrolled
        const alreadyEnrolled = user.enrolledCourses.some(
            e => e.course.toString() === courseId
        );

        if (alreadyEnrolled) {
            return res.status(400).json({
                status: 'fail',
                message: 'Already enrolled in this course'
            });
        }

        // Add enrollment
        user.enrolledCourses.push({
            course: courseId,
            enrolledAt: new Date(),
            status: 'active',
            progress: 0
        });

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Successfully enrolled in course',
            data: { course }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Uneroll from course
export const unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const user = await User.findById(req.user.id);

        // Remove enrollment
        user.enrolledCourses = user.enrolledCourses.filter(
            e => e.course.toString() !== courseId
        );

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Successfully unenrolled from course'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get course detail with progress
export const getCourseDetail = async (req, res) => {
    try {
        const { courseId } = req.params;

        const user = await User.findById(req.user.id);
        const enrollment = user.enrolledCourses.find(
            e => e.course.toString() === courseId
        );

        if (!enrollment) {
            return res.status(403).json({
                status: 'fail',
                message: 'Not enrolled in this course'
            });
        }

        const course = await Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('lessons');

        if (!course) {
            return res.status(404).json({
                status: 'fail',
                message: 'Course not found'
            });
        }

        // Get progress for all lessons
        let lessonsWithProgress = [];
        if (course.lessons && course.lessons.length > 0) {
            const lessonIds = course.lessons.map(l => l._id);
            const progressRecords = await Progress.find({
                student: req.user.id,
                contentType: 'lesson',
                contentId: { $in: lessonIds }
            });

            // Map progress to lessons
            lessonsWithProgress = course.lessons.map(lesson => {
                const progressRecord = progressRecords.find(p => p.contentId.toString() === lesson._id.toString());
                return {
                    ...lesson.toObject(),
                    completed: progressRecord?.completed || false,
                    progress: progressRecord?.progress || 0
                };
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                course: {
                    ...course.toObject(),
                    lessons: lessonsWithProgress,
                    enrolledAt: enrollment.enrolledAt,
                    enrollmentProgress: enrollment.progress
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
