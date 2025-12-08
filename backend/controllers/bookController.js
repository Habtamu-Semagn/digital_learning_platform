import Book from "../models/Book.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBook = async (req, res) => {
  try {
    const { title, description, author, language, tags, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const book = await Book.create({
      title,
      description,
      author: author || "", // Optional field
      language,
      category: category || "General",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      filename: req.file.filename,
      fileUrl: `uploads/books/${req.file.filename}`,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      mimeType: req.file.mimetype,
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query - if user is authenticated and requesting their own books
    let query = {};
    if (req.user && req.query.uploadedBy === "me") {
      query.uploadedBy = req.user.id;
    }

    const books = await Book.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.json({
      books,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.views += 1;
    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const searchBooks = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    console.log("request query: ", req.query);
    const books = await Book.find(
      { $text: { $search: `${q}` } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("uploadedBy", "name email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (
      book.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this book" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "books",
      book.filename
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { uploadBook, getBooks, getBook, searchBooks, deleteBook };
