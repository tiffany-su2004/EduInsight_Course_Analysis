// -----------------------------------------------------------
// 📚 courseRoutes.js — Admin, Instructor, and Student endpoints
// -----------------------------------------------------------

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  // Instructor routes
  addCourse,
  getInstructorCourses,
  updateInstructorCourse,
  deleteInstructorCourse,

  // Admin routes
  getPendingCourses,
  getAllCoursesForAdmin,
  updateCourseStatus,

  // Student route
  getApprovedCourses,
} from "../controllers/courseController.js";

const router = express.Router();

// ===========================================================
// 🧑‍🏫 INSTRUCTOR ROUTES
// ===========================================================

// Add a new course (auto "Pending" status)
router.post("/add", verifyToken, addCourse);

// View all submitted courses by the logged-in instructor
router.get("/my", verifyToken, getInstructorCourses);

// Update a specific course (owned by the instructor)
router.put("/update/:course_id", verifyToken, updateInstructorCourse);

// Delete a specific course (owned by the instructor)
router.delete("/delete/:course_id", verifyToken, deleteInstructorCourse);

// ===========================================================
// 👨‍💼 ADMIN ROUTES
// ===========================================================

// View all pending courses awaiting approval
router.get("/pending", verifyToken, getPendingCourses);

// View all courses (Pending + Approved + Rejected)
router.get("/all", verifyToken, getAllCoursesForAdmin);

// Approve or reject a course
router.put("/status/:course_id", verifyToken, updateCourseStatus);

// ===========================================================
// 🎓 STUDENT ROUTES
// ===========================================================

// View only approved courses
router.get("/approved", getApprovedCourses);

export default router;
