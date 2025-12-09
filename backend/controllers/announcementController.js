import Announcement from "../models/Announcement.js";

// Get all announcements
export const getAnnouncements = async (req, res) => {
    try {
        const { course, instructor } = req.query;
        const filter = {};

        // Filter by course
        if (course) filter.course = course;

        // Filter by instructor (either from query or authenticated user)
        if (instructor) {
            filter.instructor = instructor;
        } else if (req.user && req.user.role === "instructor") {
            filter.instructor = req.user.id;
        } else if (req.user && req.user.role === "user") {
            // For students, filter by enrolled courses
            const user = await req.user.populate('enrolledCourses.course');
            const courseIds = user.enrolledCourses.map(e => e.course._id);

            if (course) {
                // If specific course requested, ensure they are enrolled
                if (courseIds.some(id => id.toString() === course)) {
                    filter.course = course;
                } else {
                    // Not enrolled in requested course, return empty
                    return res.status(200).json({
                        status: "success",
                        results: 0,
                        data: { announcements: [] }
                    });
                }
            } else {
                // Show announcements from all enrolled courses
                filter.course = { $in: courseIds };
            }
        }

        const announcements = await Announcement.find(filter)
            .populate("course", "title")
            .populate("instructor", "name")
            .sort({ pinned: -1, publishedAt: -1 });

        res.status(200).json({
            status: "success",
            results: announcements.length,
            data: { announcements },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate("course", "title")
            .populate("instructor", "name email");

        if (!announcement) {
            return res.status(404).json({
                status: "fail",
                message: "Announcement not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: { announcement },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Create announcement
export const createAnnouncement = async (req, res) => {
    try {
        const announcementData = {
            ...req.body,
            instructor: req.user.id,
        };

        const announcement = await Announcement.create(announcementData);

        res.status(201).json({
            status: "success",
            data: { announcement },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                status: "fail",
                message: "Announcement not found",
            });
        }

        // Check if user is the instructor
        if (announcement.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to update this announcement",
            });
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("course", "title");

        res.status(200).json({
            status: "success",
            data: { announcement: updatedAnnouncement },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                status: "fail",
                message: "Announcement not found",
            });
        }

        // Check if user is the instructor
        if (announcement.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to delete this announcement",
            });
        }

        await Announcement.findByIdAndDelete(req.params.id);

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

// Toggle pin status
export const togglePin = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                status: "fail",
                message: "Announcement not found",
            });
        }

        // Check if user is the instructor
        if (announcement.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to pin this announcement",
            });
        }

        announcement.pinned = !announcement.pinned;
        await announcement.save();

        res.status(200).json({
            status: "success",
            data: { announcement },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};
