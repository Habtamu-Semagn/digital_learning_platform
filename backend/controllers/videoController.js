import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Video from "../models/Video.js";
import { addOrUpdateRating } from "../services/videoService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      language,
      tags,
      category,
      isPublic = true,
      duration: durationFromBody = 30,
      thumbnail:
      thumbnailFromBody = "https://example.com/default-thumbnail.jpg",
      accessLevel = "public",
      institution = undefined,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please select a video file" });
    }

    // const videoData = await uploadToCloudflare(req.file);
    const videoUrl = `uploads/videos/${req.file.filename}`;
    const video = await Video.create({
      title,
      description,
      language,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      //   videoId: videoData.uid,
      // videoUrl: videoData.playbackUrl,
      // thumbnail: videoData.thumbnail,
      // duration: videoData.duration,
      // uploadedBy: req.user.id,
      videoUrl: videoUrl,
      thumbnail: thumbnailFromBody,
      duration: durationFromBody,
      uploadedBy: req.user.id,
      institution,
      isPublic, // Convert string to boolean
      accessLevel,
      // status: videoData.ready ? "ready" : "processing",
      // processingProgress: videoData.ready ? 100 : 0,
      // publishedAt: videoData.ready ? new Date() : null,
      //streamData: videoData, // Store complete Cloudflare response
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query - if user is authenticated and requesting their own videos
    let query = {};
    if (req.user && req.query.uploadedBy === "me") {
      query.uploadedBy = req.user.id;
    }

    const videos = await Video.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Video.countDocuments(query);

    res.status(200).json({
      videos,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({ message: "Video not found" });
    }

    video.views += 1;
    await video.save();
    res.status(200).json({ video });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    console.log(q);
    const videos = await Video.find(
      { $text: { $search: `${q}` } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("uploadedBy", "name email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found!" });
    }

    if (
      video.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this video" });
    }

    const filePath = path.join(process.cwd(), video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const trackWatchTime = async (req, res) => {
  try {
    const { watchTime } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.totalWatchTime += watchTime;
    video.views += 1;

    await video.save();

    res.json({ message: "watch time recorded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const addRating = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const { rating, comment } = req.body;
    console.log("rating on add rating: ", req.body);
    const { id } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Authentication required to add a rating" });
    }

    const result = await addOrUpdateRating({
      videoId: id,
      userId,
      rating,
      comment,
    });

    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({ message: err.message || "Internal server error" });
  }
};
const updateVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, processingProgress } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const allowedStatuses = [
      "processing",
      "ready",
      "published",
      "archived",
      "failed",
    ];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `status is required and must be one of: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    if (processingProgress !== undefined) {
      const prog = Number(processingProgress);
      if (Number.isNaN(prog) || prog < 0 || prog > 100) {
        return res.status(400).json({
          message: "processingProgress must be a number between 0 and 100",
        });
      }
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.status = status;
    if (processingProgress !== undefined)
      video.processingProgress = Number(processingProgress);

    if (status === "published" && !video.publishedAt) {
      video.publishedAt = new Date();
    }

    await video.save();

    return res.status(200).json({
      message: "Video status updated",
      videoId: video._id,
      status: video.status,
      processingProgress: video.processingProgress,
      publishedAt: video.publishedAt || null,
    });
  } catch (err) {
    console.error("updateVideoStatus error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};
export {
  uploadVideo,
  getVideos,
  getVideo,
  searchVideos,
  deleteVideo,
  updateVideoStatus,
  trackWatchTime,
  addRating,
};
