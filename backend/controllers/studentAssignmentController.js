import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

// Get student's assignments
export const getMyAssignments = async (req, res) => {
    try {
        const { status, courseId } = req.query;

        // Get enrolled courses
        const user = await User.findById(req.user.id);
        const enrolledCourseIds = user.enrolledCourses.map(e => e.course);

        const query = { course: { $in: enrolledCourseIds } };
        if (courseId) query.course = courseId;
        // Always force published status for students, unless specific logic dictates otherwise
        query.status = 'published';

        const assignments = await Assignment.find(query)
            .populate('course', 'title')
            .populate('instructor', 'name')
            .sort('-dueDate');

        // Add submission status for each
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = assignment.submissions.find(
                s => s.student.toString() === req.user.id
            );

            return {
                ...assignment.toObject(),
                submissionStatus: submission ? submission.status : 'pending',
                grade: submission?.grade || null,
                feedback: submission?.feedback || null,
                hasSubmitted: !!submission,
                submittedAt: submission?.submittedAt || null
            };
        });

        res.status(200).json({
            status: 'success',
            results: assignmentsWithStatus.length,
            data: { assignments: assignmentsWithStatus }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get single assignment
export const getAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId)
            .populate('course', 'title')
            .populate('instructor', 'name email');

        if (!assignment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Assignment not found'
            });
        }

        // Check enrollment
        const user = await User.findById(req.user.id);
        const isEnrolled = user.enrolledCourses.some(
            e => e.course.toString() === assignment.course._id.toString()
        );

        if (!isEnrolled) {
            return res.status(403).json({
                status: 'fail',
                message: 'Not enrolled in this course'
            });
        }

        // Get student's submission
        const submission = assignment.submissions.find(
            s => s.student.toString() === req.user.id
        );

        res.status(200).json({
            status: 'success',
            data: {
                assignment: {
                    ...assignment.toObject(),
                    hasSubmitted: !!submission,
                    submission: submission || null
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

// Submit assignment
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { content, attachments } = req.body;

        if (!content) {
            return res.status(400).json({
                status: 'fail',
                message: 'Submission content is required'
            });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Assignment not found'
            });
        }

        // Check if already submitted
        const existingSubmission = assignment.submissions.find(
            s => s.student.toString() === req.user.id
        );

        if (existingSubmission) {
            return res.status(400).json({
                status: 'fail',
                message: 'Assignment already submitted. Contact instructor to resubmit.'
            });
        }

        // Add submission
        assignment.submissions.push({
            student: req.user.id,
            submittedAt: new Date(),
            content,
            attachments: attachments || [],
            status: 'submitted'
        });

        await assignment.save();

        res.status(200).json({
            status: 'success',
            message: 'Assignment submitted successfully',
            data: { assignment }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get student's submission
export const getMySubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Assignment not found'
            });
        }

        const submission = assignment.submissions.find(
            s => s.student.toString() === req.user.id
        );

        if (!submission) {
            return res.status(404).json({
                status: 'fail',
                message: 'No submission found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { submission }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
