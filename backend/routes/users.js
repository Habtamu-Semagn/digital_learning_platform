// routes/users.js
import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getUsers,
  // getUserbaseUrl,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../controllers/userController.js";

const router = express.Router();

// 🔐 All user routes are protected
router.get("/", protect, getUsers);
router.get("/:id", protect, getUser);
router.patch("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.patch("/:id/role", protect, updateUserRole);

export default router;
