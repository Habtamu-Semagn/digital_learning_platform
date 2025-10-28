import Video from "../models/Video.js";
import { addOrUpdateRating } from "../services/videoService.js";
const uploadVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      language,
      tags,
      isPublic = true,
      accessLevel = "public",
      institution = undefined,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please select a video file" });
    }

    const videoData = await uploadToCloudflare(req.file);

    const video = await Video.create({
      title,
      description,
      language,
      tags: tags ? tags.split(",") : [],
      //   videoId: videoData.uid,
      videoUrl: videoData.playbackUrl,
      thumbnail: videoData.thumbnail,
      duration: videoData.duration,
      uploadedBy: req.user.id,
      institution,
      isPublic: isPublic === "true", // Convert string to boolean
      accessLevel,
      status: videoData.ready ? "ready" : "processing",
      processingProgress: videoData.ready ? 100 : 0,
      publishedAt: videoData.ready ? new Date() : null,
      streamData: videoData, // Store complete Cloudflare response
    });

    res.status(201).json(video);
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

    const filePath = path.join(__dirname, "..", "public", video.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const videos = (await Video.find().populate("uploadedBy", "name email"))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Video.countDocuments();

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
  deleteVideo,
  updateVideoStatus,
  trackWatchTime,
  addRating,
};
