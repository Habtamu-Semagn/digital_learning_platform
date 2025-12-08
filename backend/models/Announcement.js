import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Announcement title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        content: {
            type: String,
            required: [true, "Announcement content is required"],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Instructor is required"],
        },
        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal",
        },
        pinned: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
        viewedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for view count
announcementSchema.virtual("viewCount").get(function () {
    return this.viewedBy ? this.viewedBy.length : 0;
});

// Index for faster queries
announcementSchema.index({ course: 1, instructor: 1 });
announcementSchema.index({ pinned: -1, publishedAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
