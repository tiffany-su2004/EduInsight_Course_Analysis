import express from "express";
import {
  addCourseByInstructor,
  updateCourseByInstructor,
  deleteCourseByInstructor,
  getInstructorCourses,
  getInstructorAnalytics,
} from "../controllers/instructorController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-course", authMiddleware, addCourseByInstructor);
router.put("/update-course/:course_id", authMiddleware, updateCourseByInstructor);
router.delete("/delete-course/:course_id", authMiddleware, deleteCourseByInstructor);
router.get("/my-courses", authMiddleware, getInstructorCourses);
router.get("/analytics/:instructorId", authMiddleware, getInstructorAnalytics);

export default router;
