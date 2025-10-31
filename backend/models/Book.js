import mongoose from "mongoose";
const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      default: "en",
      maxlength: 12,
    },
    tags: [String],
    filename: [String],
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ["public", "private", "institution"],
      default: "public",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: "text", description: "text", author: "text" });
const Book = mongoose.model("Book", bookSchema);
export default Book;
