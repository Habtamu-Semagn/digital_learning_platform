// app.js or server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Route imports
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const videoRoutes = require("./routes/videos");
const analyticsRoutes = require("./routes/analytics");
const institutionRoutes = require("./routes/institutions");
const userRoutes = require("./routes/users");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/users", userRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      status: "fail",
      message: "File too large",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
  }

  // MongoDB duplicate key
  if (error.code === 11000) {
    return res.status(400).json({
      status: "fail",
      message: "Duplicate field value entered",
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Internal server error",
  });
});

module.exports = app;
