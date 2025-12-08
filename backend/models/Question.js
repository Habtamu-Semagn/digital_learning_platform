import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Question title is required"],
            trim: true,
            maxlength: [300, "Title cannot exceed 300 characters"],
        },
        content: {
            type: String,
            required: [true, "Question content is required"],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
        },
        askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        isResolved: {
            type: Boolean,
            default: false,
        },
        answers: [
            {
                content: {
                    type: String,
                    required: true,
                },
                answeredBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                isInstructorAnswer: {
                    type: Boolean,
                    default: false,
                },
                isAccepted: {
                    type: Boolean,
                    default: false,
                },
                upvotes: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for answer count
questionSchema.virtual("answerCount").get(function () {
    return this.answers ? this.answers.length : 0;
});

// Virtual for upvote count
questionSchema.virtual("upvoteCount").get(function () {
    return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for has accepted answer
questionSchema.virtual("hasAcceptedAnswer").get(function () {
    return this.answers
        ? this.answers.some((answer) => answer.isAccepted)
        : false;
});

// Index for faster queries
questionSchema.index({ course: 1, isResolved: 1 });
questionSchema.index({ askedBy: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;
