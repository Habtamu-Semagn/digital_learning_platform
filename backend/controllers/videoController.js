const Video = require("../models/Video");

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

module.exports = {
  uploadVideo,
  getVideos,
  trackWatchTime,
};
