import express from "express";
import * as courseController from "../controllers/courseController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router
    .route("/")
    .get(courseController.getAllCourses)
    .post(courseController.createCourse);

router.get("/my-students", protect, courseController.getInstructorStudents);

router
    .route("/:id")
    .get(courseController.getCourse)
    .patch(courseController.updateCourse)
    .delete(courseController.deleteCourse);

router.post("/:id/rate", protect, courseController.rateCourse);

export default router;
