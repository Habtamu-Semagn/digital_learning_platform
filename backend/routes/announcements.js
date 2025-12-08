import express from "express";
import { protect, authorize } from "../controllers/authController.js";
import {
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
} from "../controllers/announcementController.js";

const router = express.Router();

// Announcement routes
router.get("/", protect, getAnnouncements);
router.get("/:id", protect, getAnnouncement);
router.post("/", protect, authorize("instructor", "admin"), createAnnouncement);
router.patch("/:id", protect, authorize("instructor", "admin"), updateAnnouncement);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteAnnouncement);
router.patch("/:id/pin", protect, authorize("instructor", "admin"), togglePin);

export default router;
