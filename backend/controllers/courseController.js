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
