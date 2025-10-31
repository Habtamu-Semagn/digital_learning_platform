import Analytics from "../models/Analytics.js";
import Video from "../models/Video.js";
import Book from "../models/Book.js";
import Institution from "../models/Institution.js";
import User from "../models/User.js";
import mongoose from "mongoose";
const trackEvent = async (req, res) => {
  try {
    const {
      contentId,
      contentType,
      action,
      watchTime = 0,
      progress = 0,
      rating,
      searchQuery,
      sessionId,
    } = req.body;
    const analytics = await Analytics.create({
      userId: req.user.id,
      contentId,
      contentType,
      action,
      watchTime,
      progress,
      rating,
      searchQuery,
      sessionId,
      institution: req.user.institution,
      deviceInfo: {
        browser: req.headers["user-agent"] || "Unknown",
        os: "Unknown",
        device: "Unknown",
      },
    });

    res.status(201).json({
      message: "Event tracked successfully",
      eventId: analytics._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOverview = async (req, res) => {
  try {
    const { startDate, endDate = new Date() } = req.query;

    // Default to last 30 days if no start date
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = new Date(endDate);

    // Get analytics data
    const platformData = await Analytics.getPlatformOverview(start, end);
    const platformOverview = platformData[0] || {
      totalUsers: 0,
      totalActions: 0,
      totalWatchTime: 0,
      videoViews: 0,
      bookViews: 0,
    };

    // Get popular content
    const popularVideos = await Analytics.getContentPopularity(
      "video",
      start,
      end,
      5
    );
    const popularBooks = await Analytics.getContentPopularity(
      "book",
      start,
      end,
      5
    );

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalInstitutions = await Institution.countDocuments();

    res.json({
      overview: {
        ...platformOverview,
        totalUsers,
        totalVideos,
        totalBooks,
        totalInstitutions,
      },
      popularVideos: await enrichContentData(popularVideos, "video"),
      popularBooks: await enrichContentData(popularBooks, "book"),
      dateRange: {
        start,
        end,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInstitutionAnalytics = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { startDate, endDate = new Date() } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate);

    // ✅ CLEAN: Call model method instead of writing aggregation in controller
    const institutionEngagement = await Analytics.getInstitutionEngagement(
      institutionId,
      start,
      end
    );

    // Get institution details and counts
    const [institution, userCount, videoCount, bookCount] = await Promise.all([
      Institution.findById(institutionId),
      User.countDocuments({ institution: institutionId }),
      Video.countDocuments({ institution: institutionId }),
      Book.countDocuments({ institution: institutionId }),
    ]);

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json({
      institution,
      analytics: {
        userCount,
        videoCount,
        bookCount,
        engagement: institutionEngagement,
      },
      dateRange: { start, end },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate = new Date() } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User Id" });
    }

    // Authorization check
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this user analytics" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate);

    const userEngagement = await Analytics.getUserEngagement(
      userId,
      start,
      end
    );

    // Get user's recent activity
    const recentActivity = await Analytics.find({ userId })
      .populate("contentId", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("action contentType contentId createdAt");

    res.json({
      userEngagement,
      recentActivity,
      dateRange: { start, end },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportAnalytics = async (req, res) => {
  try {
    const { format = "csv", startDate, endDate = new Date() } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate);

    // ✅ CLEAN: Use model method
    const analyticsData = await Analytics.getExportData(start, end);

    if (format === "csv") {
      const csv = convertToCSV(analyticsData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=analytics-${Date.now()}.csv`
      );
      return res.send(csv);
    }

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to enrich content data with titles
const enrichContentData = async (contentArray, contentType) => {
  const Model = contentType === "video" ? Video : Book;

  const enrichedData = await Promise.all(
    contentArray.map(async (item) => {
      const content = await Model.findById(item._id).select("title uploadedBy");
      return {
        ...item,
        title: content?.title || "Deleted Content",
        uploadedBy: content?.uploadedBy,
      };
    })
  );

  return enrichedData;
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (data.length === 0) return "";

  const headers = [
    "Date",
    "User",
    "Action",
    "Content Type",
    "Content",
    "Institution",
    "Watch Time",
    "Progress",
  ];
  const rows = data.map((item) => [
    item.createdAt.toISOString(),
    item.userId?.name || "Unknown",
    item.action,
    item.contentType,
    item.contentId?.title || "Unknown",
    item.institution?.name || "None",
    item.watchTime,
    item.progress || 0,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};

export {
  trackEvent,
  getOverview,
  getInstitutionAnalytics,
  getUserAnalytics,
  exportAnalytics,
};
