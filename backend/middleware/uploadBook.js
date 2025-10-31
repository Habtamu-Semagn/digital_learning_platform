import multer from "multer";
import path from "path";

const uploadsBooksDir = path.join(process.cwd(), "uploads", "books");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsBooksDir),
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
  const allowed = ["application/pdf", "application/epub+zip"];
  if (!allowed.includes(file.mimetype))
    return cb(new Error("Unsupported file type"), false);
  cb(null, true);
};
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});
