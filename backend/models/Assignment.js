import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Assignment title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
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
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
        points: {
            type: Number,
            default: 100,
            min: [0, "Points cannot be negative"],
        },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            default: "draft",
        },
        submissions: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                submittedAt: {
                    type: Date,
                    default: Date.now,
                },
                content: String,
                attachments: [
                    {
                        fileName: String,
                        fileUrl: String,
                    },
                ],
                grade: {
                    type: Number,
                    min: 0,
                },
                feedback: String,
                gradedAt: Date,
                gradedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                status: {
                    type: String,
                    enum: ["submitted", "graded", "late"],
                    default: "submitted",
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for submission count
assignmentSchema.virtual("submissionCount").get(function () {
    return this.submissions ? this.submissions.length : 0;
});

// Virtual for graded count
assignmentSchema.virtual("gradedCount").get(function () {
    return this.submissions
        ? this.submissions.filter((s) => s.status === "graded").length
        : 0;
});

// Index for faster queries
assignmentSchema.index({ course: 1, instructor: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
