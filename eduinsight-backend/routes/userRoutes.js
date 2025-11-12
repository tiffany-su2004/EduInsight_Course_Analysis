// -----------------------------------------------------------
// 👤 userRoutes.js — Admin user management endpoints
// -----------------------------------------------------------

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getAllStudents,
  getAllInstructors,
  deleteUser,
  toggleUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

// ===========================================================
// 👨‍💼 ADMIN USER MANAGEMENT ROUTES
// ===========================================================

// View all registered students
router.get("/students", verifyToken, getAllStudents);

// View all registered instructors
router.get("/instructors", verifyToken, getAllInstructors);

// 🔹 Delete a user (admin only)
router.delete("/:user_id", verifyToken, deleteUser);

// 🔹 Suspend or Reactivate user account (admin only)
router.put("/:user_id/status", verifyToken, toggleUserStatus);

export default router;
