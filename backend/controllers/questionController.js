import Question from "../models/Question.js";

// Get all questions
export const getQuestions = async (req, res) => {
    try {
        const { course, status, search } = req.query;
        const filter = {};

        // Filter by course
        if (course) filter.course = course;

        // Filter by resolved status
        if (status === "resolved") {
            filter.isResolved = true;
        } else if (status === "unresolved") {
            filter.isResolved = false;
        }

        // Search in title and content
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ];
        }

        const questions = await Question.find(filter)
            .populate("course", "title")
            .populate("askedBy", "name avatar")
            .populate("answers.answeredBy", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            results: questions.length,
            data: { questions },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Get single question
export const getQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate("course", "title")
            .populate("askedBy", "name email avatar")
            .populate("answers.answeredBy", "name avatar")
            .populate("upvotes", "name");

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        // Increment view count
        question.views += 1;
        await question.save();

        res.status(200).json({
            status: "success",
            data: { question },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Create question
export const createQuestion = async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            askedBy: req.user.id,
        };

        const question = await Question.create(questionData);

        res.status(201).json({
            status: "success",
            data: { question },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Update question
export const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        // Check if user is the one who asked
        if (question.askedBy.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to update this question",
            });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("course", "title");

        res.status(200).json({
            status: "success",
            data: { question: updatedQuestion },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        // Check if user is the one who asked or an instructor
        if (
            question.askedBy.toString() !== req.user.id &&
            req.user.role !== "instructor"
        ) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to delete this question",
            });
        }

        await Question.findByIdAndDelete(req.params.id);

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

// Add answer to question
export const addAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        const answer = {
            content,
            answeredBy: req.user.id,
            isInstructorAnswer: req.user.role === "instructor",
        };

        question.answers.push(answer);
        await question.save();

        // Populate the answer
        await question.populate("answers.answeredBy", "name avatar");

        res.status(201).json({
            status: "success",
            data: { answer: question.answers[question.answers.length - 1] },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Accept answer (instructor only)
export const acceptAnswer = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        const answer = question.answers.id(req.params.answerId);

        if (!answer) {
            return res.status(404).json({
                status: "fail",
                message: "Answer not found",
            });
        }

        // Unaccept all other answers
        question.answers.forEach((a) => {
            a.isAccepted = false;
        });

        // Accept this answer
        answer.isAccepted = true;
        await question.save();

        res.status(200).json({
            status: "success",
            data: { answer },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Toggle resolved status
export const toggleResolve = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        // Only instructor or question author can mark as resolved
        if (
            question.askedBy.toString() !== req.user.id &&
            req.user.role !== "instructor"
        ) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to resolve this question",
            });
        }

        question.isResolved = !question.isResolved;
        await question.save();

        res.status(200).json({
            status: "success",
            data: { question },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Upvote question
export const upvoteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        const userId = req.user.id;
        const upvoteIndex = question.upvotes.indexOf(userId);

        if (upvoteIndex > -1) {
            // Remove upvote
            question.upvotes.splice(upvoteIndex, 1);
        } else {
            // Add upvote
            question.upvotes.push(userId);
        }

        await question.save();

        res.status(200).json({
            status: "success",
            data: { upvoteCount: question.upvotes.length },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Upvote answer
export const upvoteAnswer = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found",
            });
        }

        const answer = question.answers.id(req.params.answerId);

        if (!answer) {
            return res.status(404).json({
                status: "fail",
                message: "Answer not found",
            });
        }

        const userId = req.user.id;
        const upvoteIndex = answer.upvotes.indexOf(userId);

        if (upvoteIndex > -1) {
            // Remove upvote
            answer.upvotes.splice(upvoteIndex, 1);
        } else {
            // Add upvote
            answer.upvotes.push(userId);
        }

        await question.save();

        res.status(200).json({
            status: "success",
            data: { upvoteCount: answer.upvotes.length },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};
