const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [200, "Title can't be more than 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "description can't be more than 1000 characters long"],
    },
    // Cloudflare Stream/YouTube Information
    // videoId: {
    //   type: String,
    //   required: [true, "Video ID from hosting provider is required"],
    //   unique: true,
    // },

    videoUrl: {
      type: String,
      required: [true, "Video playback URL is required"],
    },

    thumbnail: {
      type: String, // URL to thumbnail image
      required: [true, "Thumbnail URL is required"],
    },

    duration: {
      type: Number, // Duration in seconds
      required: [true, "Video duration is required"],
      min: [1, "Duration must be at least 1 second"],
    },

    // Metadata
    language: {
      type: String,
      default: "en",
      maxlength: 10,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // category: {
    //   type: String,
    //   trim: true,
    //   maxlength: 50,
    // },

    // Video Specifications
    format: {
      type: String,
      enum: ["mp4", "webm", "mov", "avi"],
      default: "mp4",
    },

    resolution: {
      type: String, // e.g., '1080p', '720p'
      default: "1080p",
    },

    fileSize: {
      type: Number, // Size in bytes (optional - from original upload)
      default: 0,
    },

    // Ownership & References
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader user ID is required"],
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution", // Optional: for institutional content
    },

    // Analytics & Engagement
    views: {
      type: Number,
      default: 0,
    },

    totalWatchTime: {
      type: Number, // Total watch time in seconds
      default: 0,
    },

    averageWatchTime: {
      type: Number, // Average watch time per view in seconds
      default: 0,
    },

    completionRate: {
      type: Number, // Percentage of users who watched entire video
      default: 0,
      min: 0,
      max: 100,
    },

    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Access Control
    isPublic: {
      type: Boolean,
      default: true,
    },

    accessLevel: {
      type: String,
      enum: ["public", "institution", "private"],
      default: "public",
    },

    // Status & Moderation
    status: {
      type: String,
      enum: ["processing", "ready", "published", "archived", "failed"],
      default: "processing",
    },

    processingProgress: {
      type: Number, // 0-100 percentage
      default: 0,
      min: 0,
      max: 100,
    },

    // moderatedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", // Admin who moderated this video
    // },

    // moderationNotes: {
    //   type: String,
    //   maxlength: 500,
    // },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    publishedAt: {
      type: Date,
    },

    // Cloudflare Stream Specific Fields
    streamData: {
      type: mongoose.Schema.Types.Mixed, // Store raw response from Cloudflare
      default: {},
    },
  },
  {
    timestamps: true, // Mongoose will automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model("Video", videoSchema);
