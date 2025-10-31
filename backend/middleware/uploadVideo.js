import multer from "multer";
import path from "path";

const uploadsVideosDir = path.join(process.cwd(), "uploads", "videos");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsVideosDir),
  filename: (req, file, cb) => {
    const originalName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/\s+/g, "_");
    cb(
      null,
      `${Date.now()}-${originalName}-${path.extname(file.originalname)}`
    );
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = [
    "video/mp4",
    "video/mov",
    "video/quicktime",
    "video/mkv",
    "video/x-vlc",
    "application/octet-stream",
  ];
  if (!allowed.includes(file.mimetype))
    return cb(new Error("Unsupported video format"), false);
  cb(null, true);
};
export const videoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});
