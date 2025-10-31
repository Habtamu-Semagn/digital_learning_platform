import path from "path";
import { promises as fs } from "fs";
export const ValidateVideoFields = async (req, res, next) => {
  const { title, category, language = "en" } = req.body;
  if (!title || !category || !language) {
    if (req.file?.destination && req.file?.filename) {
      const filePath = path.join(req.file.destination, req.file.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(
          "Failed to remove uploaded video after validation error:",
          error
        );
      }
    }

    return res
      .status(400)
      .json({ status: "fail", message: "Missing required fields" });
  }
  next();
};
