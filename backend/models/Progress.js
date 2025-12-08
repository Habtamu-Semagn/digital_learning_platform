import mongoose from 'mongoose';
const { Schema } = mongoose;

const progressSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    contentType: {
        type: String,
        enum: ['video', 'book', 'lesson', 'document'],
        required: true
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true
    },

    // Progress tracking
    completed: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // For videos and books
    watchTime: {
        type: Number,
        default: 0 // seconds
    },
    lastPosition: {
        type: Number,
        default: 0 // seconds for video, page for books
    },

    // Timestamps
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
progressSchema.index({ student: 1, contentType: 1, contentId: 1 }, { unique: true });
progressSchema.index({ student: 1, course: 1 });
progressSchema.index({ student: 1, completed: 1 });

// Virtual: duration in minutes
progressSchema.virtual('watchTimeMinutes').get(function () {
    return Math.round(this.watchTime / 60);
});

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
