// -----------------------------------------------------------
// 🔐 protectedRoutes.js — Example routes requiring JWT auth
// -----------------------------------------------------------

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Example route that only logged-in users can access
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.role}! You are authorized.`,
    user_id: req.user.user_id,
    role: req.user.role,
  });
});

export default router;
