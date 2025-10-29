import mongoose from "mongoose";
import User from "../models/User.js";
import Video from "../models/Video.js";
import Book from "../models/Book.js";
import Analytics from "../models/Analytics.js";
//   getUserbaseUrl,
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("institution", "name emailDomain");
    if (!user) {
      res.status(404).json({ status: "fail", message: "User not found!" });
    }

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorised to view this user",
      });
    }
    // Get user's content statistics
    const [bookCount, videoCount, userActivity] = await Promise.all([
      Book.countDocuments({ uploadedBy: userId }),
      Video.countDocuments({ uploadedBy: userId }),
      Analytics.find({ userId })
        .populate("contentId", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("action contentType contentId createdAt"),
    ]);

    const userWithStats = {
      ...user.toObject(),
      statistics: {
        booksUploaded: bookCount,
        videosUploaded: videoCount,
        recentActivity: userActivity,
      },
    };
    res.json({ status: "success", data: { user: userWithStats } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log("req ", req);
    const userId = req.params.id;
    const { name, institution, avatar, isActive } = req.body;

    if (institution && !mongoose.Types.ObjectId.isValid(institution)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid institution ID",
      });
    }
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to update this user",
      });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (institution) updateData.institution = institution;

    if (req.user.role === "admin") {
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No valid fields to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: { user: updatedUser },
      message: "User updated successfully",
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

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "admin") {
      if (req.user.id === userId) {
        return res.status(403).json({
          status: 'fail',
          message: "You cannot delete your own account"
        })
      }
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this user",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // check if user has upload content
    const [bookCount, videoCount] = await Promise.all([
      Book.countDocuments({ uploadedBy: userId }),
      Video.countDocuments({ uploadedBy: userId }),
    ]);

    // soft delete make inactive
    if (bookCount > 0 || videoCount > 0) {
      await User.findByIdAndUpdate(userId, { isActive: false });

      return res.json({
        status: "success",
        message: "User deactivated successfully (user has uploaded content)",
        data: {
          booksUploaded: bookCount,
          videosUploaded: videoCount,
        },
      });
    }

    // hard delete remove user
    await User.findByIdAndDelete(userId);

    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: "You are not authorized to update this user"
      })
    }

    // Validate role
    const validRoles = ["admin", "user", "instructor", "writer"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // preventing admin from changing role
    if (req.user.id === userId) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot change your own role",
      });
    }

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // update role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      status: "success",
      data: { user: updatedUser },
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export { getUsers, getUser, updateUser, deleteUser, updateUserRole };
