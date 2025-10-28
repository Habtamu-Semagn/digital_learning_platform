// routes/videos.js
import express from "express";
import {
  uploadVideo,
  getVideos,
  getVideo,
  trackWatchTime,
  updateVideoStatus,
  deleteVideo,
  addRating,
} from "../controllers/videoController.js";
import { protect } from "../controllers/authController.js";
// import {uploadVideo: videoUpload } from "../middleware/upload";

const router = express.Router();

// 🔓 Public routes
router.get("/", getVideos); // Get all videos
router.get("/:id", getVideo); // Get single video

// 🔐 Protected routes
// router.post("/upload", protect, videoUpload.single("video"), uploadVideo);
router.post("/:id/watch", protect, trackWatchTime); // Track video watch time
router.post("/:id/rate", protect, addRating); // Add rating to video
router.patch("/:id/status", protect, updateVideoStatus); // Update video status
router.delete("/:id", protect, deleteVideo); // Delete video

export default router;
