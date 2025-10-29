import Book from "../models/Book.js";
import path from "path";
import fs from "fs";

const uploadBook = async (req, res) => {
  try {
    const { title, description, author, language, tags } = req.body;
    if (!req.file) {
      res.status(400).message("Please upload a file");
    }
    const book = await Book.create({
      title,
      description,
      author,
      language,
      tags: tags ? tags.split(",") : [],
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

    const books = await Book.find().populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

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
    const books = await Book.find(
      { $text: { $search: q } },
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

    const filePath = path.join(__dirname, "..", "public", book.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  uploadBook,
  getBooks,
  getBook,
  searchBooks,
  deleteBook,
};
