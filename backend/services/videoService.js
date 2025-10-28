import mongoose from "mongoose";
import Video from "../models/Video.js";
export async function addOrUpdateRating({ videoId, userId, rating, comment }) {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    const err = new Error("Invalid video id");
    err.status = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid user id");
    err.status = 400;
    throw err;
  }

  const video = await Video.findById(videoId);
  if (!video) {
    const err = new Error("Video not found");
    err.status = 404;
    throw err;
  }

  const value = Number(rating);
  if (isNaN(value) || value < 1 || value > 5) throw new Error("Invalid rating");

  const existing = video.ratings.findIndex(
    (r) => String(r.user) === String(userId)
  );

  if (existing >= 0) {
    video.ratings[existing].rating = value;
    if (comment) video.ratings[existing].comment = comment;
    video.ratings[existing].createdAt = new Date();
  } else {
    video.ratings.push({ user: userId, rating: value, comment });
  }

  const sum = video.ratings.reduce((acc, r) => acc + r.rating, 0);
  video.averageRating = +(sum / video.ratings.length).toFixed(1);

  await video.save();

  return {
    message: existing >= 0 ? "Rating updated" : "Rating added",
    averageRating: video.averageRating,
    totalRatings: video.ratings.length,
  };
}
