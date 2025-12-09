import Course from "../models/Course.js";
// Checking if APIFeatures exists first would be better, but I'll assume standard pattern or write simple logic if it fails.
// Actually, let's check if APIFeatures exists in a subsequent step if this fails, or just write standard mongoose queries.
// For now, I will write standard queries to be safe and avoid dependency issues if the util is missing.

export const getAllCourses = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Automatically filter by instructor if user is authenticated
        // This ensures instructors only see their own courses
        if (req.user) {
            queryObj.instructor = req.user.id;
        }

        let query = Course.find(queryObj).populate("instructor", "name email").populate("institution", "name");

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        const courses = await query;

        res.status(200).json({
            status: "success",
            results: courses.length,
            data: {
                courses,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message,
        });
    }
};

export const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate("instructor", "name email").populate("institution", "name");

        if (!course) {
            return res.status(404).json({
                status: "fail",
                message: "No course found with that ID",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                course,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message,
        });
    }
};

export const createCourse = async (req, res) => {
    try {
        const newCourse = await Course.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                course: newCourse,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!course) {
            return res.status(404).json({
                status: "fail",
                message: "No course found with that ID",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                course,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({
                status: "fail",
                message: "No course found with that ID",
            });
        }

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message,
        });
    }
};

export const rateCourse = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                status: "fail",
                message: "No course found with that ID",
            });
        }

        // Check if user already rated
        const existingRatingIndex = course.ratings.findIndex(
            (r) => r.user.toString() === req.user.id
        );

        const ratingData = {
            user: req.user.id,
            rating: Number(rating),
            comment,
            createdAt: new Date(),
        };

        if (existingRatingIndex > -1) {
            // Update existing rating
            course.ratings[existingRatingIndex] = ratingData;
        } else {
            // Add new rating
            course.ratings.push(ratingData);
        }

        // Calculate average
        const totalRating = course.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        course.averageRating = totalRating / course.ratings.length;

        await course.save();

        res.status(200).json({
            status: "success",
            data: {
                course,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
export const getInstructorStudents = async (req, res) => {
    try {
        const { courseId } = req.query;
        const instructorId = req.user.id;
        const User = (await import("../models/User.js")).default;
        const Course = (await import("../models/Course.js")).default;

        let courseIds = [];

        if (courseId && courseId !== 'all') {
            // Verify ownership
            const course = await Course.findOne({ _id: courseId, instructor: instructorId });
            if (!course) {
                return res.status(404).json({
                    status: "fail",
                    message: "Course not found or does not belong to you"
                });
            }
            courseIds = [courseId];
        } else {
            // Get all instructor courses
            const courses = await Course.find({ instructor: instructorId }).select('_id');
            courseIds = courses.map(c => c._id);
        }

        const students = await User.find({
            'enrolledCourses.course': { $in: courseIds }
        }).select('name email institution role isActive createdAt');

        res.status(200).json({
            status: "success",
            results: students.length,
            users: students
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};
