// -----------------------------------------------------------
// 🛣️ authRoutes.js
// -----------------------------------------------------------
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser); // ✅ matches export name
router.post("/login", loginUser);

export default router;
