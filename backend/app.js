// app.js or server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// Route imports
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import videoRoutes from "./routes/videos.js";
import analyticsRoutes from "./routes/analytics.js";
import institutionRoutes from "./routes/institutions.js";
import userRoutes from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});
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
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

export default app;
// Global error handler
// app.use((error, req, res, next) => {
//   console.error("Error:", error);

//   // Multer errors
//   if (error.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({
//       status: "fail",
//       message: "File too large",
//     });
//   }

//   // JWT errors
//   if (error.name === "JsonWebTokenError") {
//     return res.status(401).json({
//       status: "fail",
//       message: "Invalid token",
//     });
//   }

//   // MongoDB duplicate key
//   if (error.code === 11000) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Duplicate field value entered",
//     });
//   }

//   // Default error
//   res.status(error.statusCode || 500).json({
//     status: "error",
//     message: error.message || "Internal server error",
//   });
// });
