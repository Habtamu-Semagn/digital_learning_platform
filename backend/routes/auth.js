// routes/auth.js
import express from "express";
import { signUp, login, protect, updatePassword } from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/signup", signUp);
router.post("/login", login);

// Protected routes (example - add your protected routes here)
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

router.patch("/update-password", protect, updatePassword);

export default router;
