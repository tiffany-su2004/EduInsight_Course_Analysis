import express from "express";
import {
  getAllStudents,
  getAllStudentsWithFeedback,
  getAllInstructors,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/students", getAllStudents);
router.get("/students/feedbacks", getAllStudentsWithFeedback);
router.get("/instructors", getAllInstructors);

export default router;
