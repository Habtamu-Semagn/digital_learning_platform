// routes/auth.js
const express = require("express");
const { signUp, login, protect } = require("../controllers/authController");

const router = express.Router();

// 🔓 Public routes
router.post("/signup", signUp);
router.post("/login", login);

// 🔐 Protected routes (example - add your protected routes here)
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

module.exports = router;
