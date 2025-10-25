// routes/books.js
const express = require("express");
const {
  uploadBook,
  getBooks,
  getBook,
  searchBooks,
  deleteBook,
} = require("../controllers/bookController");
const { protect } = require("../controllers/authController"); // Use your auth controller
const upload = require("../middleware/upload");

const router = express.Router();

// 🔓 Public routes
router.get("/", getBooks);
router.get("/search", searchBooks);
router.get("/:id", getBook);

// 🔐 Protected routes
router.post("/upload", protect, upload.single("file"), uploadBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;
