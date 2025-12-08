import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// Get all progress
export const getMyProgress = async (req, res) => {
    try {
        const { courseId } = req.query;

        const query = { student: req.user.id };
        if (courseId) query.course = courseId;

        const progress = await Progress.find(query)
            .populate('course', 'title')
            .sort('-lastAccessedAt');

        res.status(200).json({
            status: 'success',
            results: progress.length,
            data: { progress }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update progress
export const updateProgress = async (req, res) => {
    try {
        const { contentType, contentId, course, progress: progressValue, watchTime, lastPosition } = req.body;

        if (!contentType || !contentId) {
            return res.status(400).json({
                status: 'fail',
                message: 'contentType and contentId are required'
            });
        }

        const updateData = {
            student: req.user.id,
            contentType,
            contentId,
            course,
            progress: progressValue || 0,
            lastAccessedAt: new Date()
        };

        if (watchTime !== undefined) updateData.watchTime = watchTime;
        if (lastPosition !== undefined) updateData.lastPosition = lastPosition;
        if (progressValue >= 100) {
            updateData.completed = true;
            updateData.completedAt = new Date();
        }

        const progressRecord = await Progress.findOneAndUpdate(
            { student: req.user.id, contentType, contentId },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Update course progress in User model if course is provided
        if (course) {
            await updateCourseProgress(req.user.id, course);
        }

        res.status(200).json({
            status: 'success',
            data: { progress: progressRecord }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Helper: Update overall course progress
async function updateCourseProgress(userId, courseId) {
    try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId).populate('lessons');

        if (!course || !course.lessons || course.lessons.length === 0) return;

        const lessonIds = course.lessons.map(l => l._id);
        const completedLessons = await Progress.countDocuments({
            student: userId,
            contentType: 'lesson',
            contentId: { $in: lessonIds },
            completed: true
        });

        const overallProgress = Math.round((completedLessons / course.lessons.length) * 100);

        const enrollmentIndex = user.enrolledCourses.findIndex(
            e => e.course.toString() === courseId.toString()
        );

        if (enrollmentIndex !== -1) {
            user.enrolledCourses[enrollmentIndex].progress = overallProgress;
            user.enrolledCourses[enrollmentIndex].lastAccessedAt = new Date();

            if (overallProgress === 100) {
                user.enrolledCourses[enrollmentIndex].status = 'completed';
            }

            await user.save();
        }
    } catch (error) {
        console.error('Error updating course progress:', error);
    }
}
