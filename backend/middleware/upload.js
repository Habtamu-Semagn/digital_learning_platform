import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(process.cwd(), "backend", "uploads", "books")),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
})
const fileFilter = (req, file, cb) => {
    const allowed = ["application/pdf", "application/epub+zip"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Unsupported file type"), false);
    cb(null, true);
}
export const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })