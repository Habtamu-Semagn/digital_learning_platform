import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Content Information
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },

    contentType: {
      type: String,
      enum: ["Video", "Book"],
      required: true,
    },

    // Institution Context
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
    },

    // Action/Event Details
    action: {
      type: String,
      enum: ["view", "watch", "download", "complete", "search", "rate"],
      required: true,
    },

    // Metrics
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },

    progress: {
      type: Number, // percentage 0-100
      min: 0,
      max: 100,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    searchQuery: {
      type: String,
      trim: true,
    },

    // Session Information
    sessionId: {
      type: String,
    },

    deviceInfo: {
      type: {
        browser: String,
        os: String,
        device: String,
      },
      default: {},
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.statics.getUserEngagement = function (
  userId,
  startDate,
  endDate
) {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  return this.aggregate([
    {
      $match: {
        userId: objectUserId,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: "$contentType",
        totalActions: { $sum: 1 },
        totalWatchTime: { $sum: "$watchTime" },
        avgProgress: { $avg: "$progress" },
        lastActivity: { $max: "$createdAt" },
      },
    },
  ]);
};

// Get content popularity
analyticsSchema.statics.getContentPopularity = function (
  contentType,
  startDate,
  endDate,
  limit = 10
) {
  return this.aggregate([
    {
      $match: {
        contentType,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: "$contentId",
        totalViews: { $sum: 1 },
        totalWatchTime: { $sum: "$watchTime" },
        uniqueUsers: { $addToSet: "$userId" },
        avgProgress: { $avg: "$progress" },
      },
    },
    {
      $project: {
        totalViews: 1,
        totalWatchTime: 1,
        uniqueUsersCount: { $size: "$uniqueUsers" },
        avgProgress: 1,
      },
    },
    {
      $sort: { totalViews: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

// Get platform overview
analyticsSchema.statics.getPlatformOverview = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $addToSet: "$userId" },
        totalActions: { $sum: 1 },
        totalWatchTime: { $sum: "$watchTime" },
        videoViews: {
          $sum: { $cond: [{ $eq: ["$contentType", "video"] }, 1, 0] },
        },
        bookViews: {
          $sum: { $cond: [{ $eq: ["$contentType", "book"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        totalUsers: { $size: "$totalUsers" },
        totalActions: 1,
        totalWatchTime: 1,
        videoViews: 1,
        bookViews: 1,
      },
    },
  ]);
};

// Get institution analytics by content type
analyticsSchema.statics.getInstitutionEngagement = function (
  institutionId,
  startDate,
  endDate
) {
  return this.aggregate([
    {
      $match: {
        institution: new mongoose.Types.ObjectId(institutionId),
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: "$contentType",
        totalViews: { $sum: 1 },
        totalWatchTime: { $sum: "$watchTime" },
        uniqueUsers: { $addToSet: "$userId" },
        avgProgress: { $avg: "$progress" },
      },
    },
    {
      $project: {
        contentType: "$_id",
        totalViews: 1,
        totalWatchTime: 1,
        uniqueUsersCount: { $size: "$uniqueUsers" },
        avgProgress: 1,
        _id: 0,
      },
    },
  ]);
};

// Get analytics data for export
analyticsSchema.statics.getExportData = function (
  startDate,
  endDate,
  additionalQuery = {}
) {
  return this.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    ...additionalQuery,
  })
    .populate("userId", "name email")
    .populate({
      path: "contentId",
      select: "title",
      model: function (doc) {
        return doc.contentType === "video" ? "Video" : "Book";
      },
    })
    .populate("contentId", "title")
    .populate("institution", "name")
    .sort({ createdAt: -1 });
};

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
