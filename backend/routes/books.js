import express from "express";
import {
  uploadBook,
  getBooks,
  getBook,
  searchBooks,
  deleteBook,
} from "../controllers/bookController.js";
import { protect } from "../controllers/authController.js"; // Use your auth controller
import { upload } from "../middleware/uploadBook.js";
import { validateBookFields } from "../middleware/validateBookField.js";

const router = express.Router();

// Public routes
router.get("/", getBooks);
router.get("/search", searchBooks);
router.get("/:id", getBook);

// Protected routes
router.post(
  "/upload",
  protect,
  upload.single("file"),
  validateBookFields,
  uploadBook
);
router.delete("/:id", protect, deleteBook);

export default router;
