import mongoose from "mongoose";
import Institution from "../models/Institution.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import Video from "../models/Video.js";
import Analytics from "../models/Analytics.js";

const getInstitutions = async (req, res) => {
  try {
    const { type, activeOnly = "true", search } = req.query;

    // Build query
    const query = {};

    if (activeOnly === "true") {
      query.isActive = true;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const institutions = await Institution.find(query)
      .select("name emailDomain type logo website isActive")
      .sort({ name: 1 });

    res.json({
      status: "success",
      data: {
        institutions,
        count: institutions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        status: "fail",
        message: "Institution not found",
      });
    }

    res.json({
      status: "success",
      data: {
        institution,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const createInstitution = async (req, res) => {
  try {
    const { name, emailDomain, type, contactEmail, website, logo } = req.body;

    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [
        { emailDomain: emailDomain.toLowerCase() },
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
      ],
    });

    if (existingInstitution) {
      return res.status(400).json({
        status: "fail",
        message: "Institution with this name or email domain already exists",
      });
    }

    const institution = await Institution.create({
      name,
      emailDomain: emailDomain.toLowerCase(),
      type,
      contactEmail,
      website,
      logo,
    });

    res.status(201).json({
      status: "success",
      data: {
        institution,
      },
      message: "Institution created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "fail",
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateInstitution = async (req, res) => {
  try {
    const { name, emailDomain, type, contactEmail, website, logo, isActive } =
      req.body;

    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        status: "fail",
        message: "Institution not found",
      });
    }

    // Check for duplicate email domain
    if (emailDomain && emailDomain !== institution.emailDomain) {
      const existingInstitution = await Institution.findOne({
        emailDomain: emailDomain.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingInstitution) {
        return res.status(400).json({
          status: "fail",
          message: "Another institution with this email domain already exists",
        });
      }
    }

    const updatedInstitution = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(emailDomain && { emailDomain: emailDomain.toLowerCase() }),
        ...(type && { type }),
        ...(contactEmail && { contactEmail }),
        ...(website && { website }),
        ...(logo && { logo }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    res.json({
      status: "success",
      data: {
        institution: updatedInstitution,
      },
      message: "Institution updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        status: "fail",
        message: "Institution not found",
      });
    }

    // Check if institution has users
    const userCount = await User.countDocuments({ institution: req.params.id });

    if (userCount > 0) {
      // Soft delete - mark as inactive
      await Institution.findByIdAndUpdate(req.params.id, { isActive: false });

      return res.json({
        status: "success",
        message: "Institution deactivated (has active users)",
      });
    }

    // Hard delete if no users
    await Institution.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      message: "Institution deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getInstitutionAnalytics = async (req, res) => {
  try {
    const institutionId = req.params.id;

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        status: "fail",
        message: "Institution not found",
      });
    }

    // Get institution statistics
    const [userCount, bookCount, videoCount, recentActivity] =
      await Promise.all([
        User.countDocuments({ institution: institutionId }),
        Book.countDocuments({ institution: institutionId }),
        Video.countDocuments({ institution: institutionId }),
        Analytics.aggregate([
          {
            $match: { institution: new mongoose.Types.ObjectId(institutionId) },
          },
          {
            $group: {
              _id: "$contentType",
              totalViews: { $sum: 1 },
              totalWatchTime: { $sum: "$watchTime" },
              uniqueUsers: { $addToSet: "$userId" },
            },
          },
        ]),
      ]);

    // Get popular content
    const popularBooks = await Book.find({ institution: institutionId })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("title viewCount downloadCount uploadedBy")
      .populate("uploadedBy", "name");

    const popularVideos = await Video.find({ institution: institutionId })
      .sort({ views: -1 })
      .limit(5)
      .select("title views duration uploadedBy")
      .populate("uploadedBy", "name");

    const analytics = {
      overview: {
        totalUsers: userCount,
        totalBooks: bookCount,
        totalVideos: videoCount,
        totalContent: bookCount + videoCount,
      },
      engagement: recentActivity,
      popularContent: {
        books: popularBooks,
        videos: popularVideos,
      },
    };

    res.json({
      status: "success",
      data: {
        institution,
        analytics,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getInstitutionUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({
        status: "fail",
        message: "Institution not found",
      });
    }

    const users = await User.find({ institution: req.params.id })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ institution: req.params.id });

    res.json({
      status: "success",
      data: {
        users,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionAnalytics,
  getInstitutionUsers,
};
