import Assignment from "../models/Assignment.js";

// Get all assignments
export const getAssignments = async (req, res) => {
    try {
        const { course, instructor, status } = req.query;
        const filter = {};

        // Filter by course if provided
        if (course) filter.course = course;

        // Filter by instructor (either from query or authenticated user)
        if (instructor) {
            filter.instructor = instructor;
        } else if (req.user && req.user.role === "instructor") {
            filter.instructor = req.user.id;
        }

        // Filter by status
        if (status) filter.status = status;

        const assignments = await Assignment.find(filter)
            .populate("course", "title")
            .populate("instructor", "name email")
            .populate("submissions.student", "name email")
            .sort({ dueDate: -1 });

        res.status(200).json({
            status: "success",
            results: assignments.length,
            data: { assignments },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Get single assignment
export const getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate("course", "title")
            .populate("instructor", "name email")
            .populate("submissions.student", "name email avatar")
            .populate("submissions.gradedBy", "name");

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: { assignment },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Create assignment
export const createAssignment = async (req, res) => {
    try {
        const assignmentData = {
            ...req.body,
            instructor: req.user.id,
        };

        const assignment = await Assignment.create(assignmentData);

        res.status(201).json({
            status: "success",
            data: { assignment },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Update assignment
export const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        // Check if user is the instructor
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to update this assignment",
            });
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("course", "title");

        res.status(200).json({
            status: "success",
            data: { assignment: updatedAssignment },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        // Check if user is the instructor
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to delete this assignment",
            });
        }

        await Assignment.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Publish assignment
export const publishAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        // Check if user is the instructor
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to publish this assignment",
            });
        }

        assignment.status = "published";
        await assignment.save();

        res.status(200).json({
            status: "success",
            data: { assignment },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Get assignment submissions
export const getSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate("submissions.student", "name email avatar")
            .populate("submissions.gradedBy", "name");

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        // Check if user is the instructor
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to view submissions",
            });
        }

        res.status(200).json({
            status: "success",
            results: assignment.submissions.length,
            data: { submissions: assignment.submissions },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Grade submission
export const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                status: "fail",
                message: "Assignment not found",
            });
        }

        // Check if user is the instructor
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to grade submissions",
            });
        }

        const submission = assignment.submissions.id(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({
                status: "fail",
                message: "Submission not found",
            });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = "graded";
        submission.gradedAt = new Date();
        submission.gradedBy = req.user.id;

        await assignment.save();

        res.status(200).json({
            status: "success",
            data: { submission },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};
