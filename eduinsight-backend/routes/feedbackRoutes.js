import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addFeedbackQuestion,
  getFeedbackQuestions,
  deleteFeedbackQuestion,
  submitFeedback,
  getAllFeedbackSubmissions,
  getStudentFeedbackSubmissions,
} from "../controllers/feedbackController.js";

const router = express.Router();

// 🧩 Admin routes
router.post("/questions/add", verifyToken, addFeedbackQuestion);
router.get("/questions/:section", verifyToken, getFeedbackQuestions);
router.delete("/questions/:id", verifyToken, deleteFeedbackQuestion);
router.get("/submissions", verifyToken, getAllFeedbackSubmissions);

// 🧩 Student routes
router.post("/submit", verifyToken, submitFeedback);
router.get("/submissions/student/:student_id", verifyToken, getStudentFeedbackSubmissions);

export default router;
