import express from "express";
import { protect, authorize } from "../controllers/authController.js";
import {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    addAnswer,
    acceptAnswer,
    toggleResolve,
    upvoteQuestion,
    upvoteAnswer,
} from "../controllers/questionController.js";

const router = express.Router();

// Question routes
router.get("/", protect, getQuestions);
router.get("/:id", protect, getQuestion);
router.post("/", protect, createQuestion);
router.patch("/:id", protect, updateQuestion);
router.delete("/:id", protect, deleteQuestion);

// Answer routes
router.post("/:id/answers", protect, addAnswer);
router.patch(
    "/:id/answers/:answerId/accept",
    protect,
    authorize("instructor", "admin"),
    acceptAnswer
);

// Interaction routes
router.patch("/:id/resolve", protect, toggleResolve);
router.post("/:id/upvote", protect, upvoteQuestion);
router.post("/:id/answers/:answerId/upvote", protect, upvoteAnswer);

export default router;
