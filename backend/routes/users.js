// routes/users.js
const express = require("express");
const { protect } = require("../controllers/authController");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
} = require("../controllers/userController");

const router = express.Router();

// 🔐 All user routes are protected
router.get("/", protect, getUsers);
router.get("/:id", protect, getUser);
router.patch("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.patch("/:id/role", protect, updateUserRole);

module.exports = router;
