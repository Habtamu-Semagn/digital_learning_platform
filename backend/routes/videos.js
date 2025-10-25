// routes/videos.js
const express = require("express");
const {
  uploadVideo,
  getVideos,
  getVideo,
  trackWatchTime,
  updateVideoStatus,
  deleteVideo,
  addRating,
} = require("../controllers/videoController");
const { protect } = require("../controllers/authController");
const { uploadVideo: videoUpload } = require("../middleware/upload"); // Renamed import to avoid conflict

const router = express.Router();

// 🔓 Public routes
router.get("/", getVideos); // Get all videos
router.get("/:id", getVideo); // Get single video

// 🔐 Protected routes
router.post("/upload", protect, videoUpload.single("video"), uploadVideo);
router.post("/:id/watch", protect, trackWatchTime); // Track video watch time
router.post("/:id/rate", protect, addRating); // Add rating to video
router.patch("/:id/status", protect, updateVideoStatus); // Update video status
router.delete("/:id", protect, deleteVideo); // Delete video

module.exports = router;
